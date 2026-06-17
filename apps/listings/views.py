from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing, Category
from .serializers import ListingSerializer, CategorySerializer
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['title', 'description', 'campus_location']
    filterset_fields = ['category', 'status', 'is_active']
    ordering_fields = ['price_per_day', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        
        # Admin bisa lihat semua listing termasuk yang nonaktif
        if user.is_staff:
            queryset = Listing.objects.all().select_related(
                'owner', 'category'
            ).prefetch_related('photos')
            return queryset

        queryset = Listing.objects.filter(
            is_active=True
        ).select_related(
            'owner', 'category'
        ).prefetch_related('photos')

        owner = self.request.query_params.get('owner', None)
        if owner == 'me':
            queryset = Listing.objects.filter(
                owner=self.request.user
            ).select_related('category').prefetch_related('photos')

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, is_active=True)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def destroy(self, request, *args, **kwargs):
        listing = self.get_object()
        if listing.owner != request.user:
            return Response(
                {'error': 'Kamu tidak memiliki izin untuk menghapus listing ini.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if listing.status == 'borrowed':
            return Response(
                {'error': 'Tidak bisa menghapus listing yang sedang dipinjam.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def set_status(self, request, pk=None):
        listing = self.get_object()
        if listing.owner != request.user:
            return Response(
                {'error': 'Kamu tidak memiliki izin mengubah status listing ini.'},
                status=status.HTTP_403_FORBIDDEN
            )
        new_status = request.data.get('status')
        if new_status not in ['available', 'unavailable']:
            return Response(
                {'error': 'Status tidak valid. Pilih available atau unavailable.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        listing.status = new_status
        listing.save()
        return Response({'message': f'Status berhasil diubah menjadi {new_status}.'})
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def toggle_active(self, request, pk=None):
        listing = self.get_object()
        listing.is_active = not listing.is_active
        listing.save()
        return Response({
            'message': f'Listing berhasil {"diaktifkan" if listing.is_active else "dinonaktifkan"}.',
            'is_active': listing.is_active
        })