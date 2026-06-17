from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Transaction, Payment, Review
from .serializers import TransactionSerializer, PaymentSerializer, ReviewSerializer
from apps.notifications.models import Notification


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Transaction.objects.all().select_related(
                'listing', 'listing__owner', 'borrower'
            )
        return Transaction.objects.filter(
            Q(borrower=user) | Q(listing__owner=user)
        ).select_related(
            'listing', 'listing__owner', 'borrower'
        )

    def perform_create(self, serializer):
        transaction = serializer.save(borrower=self.request.user)
        # Kirim notifikasi ke penyedia (FR-30)
        Notification.objects.create(
            recipient=transaction.listing.owner,
            notification_type='borrow_request',
            title='Pengajuan Peminjaman Baru',
            message=f'{transaction.borrower.full_name} mengajukan peminjaman "{transaction.listing.title}" dari {transaction.start_date} sampai {transaction.end_date}.',
            transaction=transaction,
        )

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Penyedia konfirmasi pengajuan (FR-17)"""
        transaction = self.get_object()
        if transaction.listing.owner != request.user:
            return Response(
                {'error': 'Hanya penyedia yang bisa mengkonfirmasi.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if transaction.status != 'pending':
            return Response(
                {'error': 'Transaksi tidak dalam status menunggu konfirmasi.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        transaction.status = 'confirmed'
        transaction.confirmed_at = timezone.now()
        transaction.save()
        # Notifikasi ke penyewa (FR-31)
        Notification.objects.create(
            recipient=transaction.borrower,
            notification_type='confirmed',
            title='Pengajuan Dikonfirmasi',
            message=f'Pengajuan peminjaman "{transaction.listing.title}" telah dikonfirmasi. Silakan lakukan pembayaran.',
            transaction=transaction,
        )
        return Response({'message': 'Pengajuan berhasil dikonfirmasi.'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Tandai barang sudah diambil, transaksi jadi aktif"""
        transaction = self.get_object()
        if transaction.listing.owner != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Hanya penyedia atau admin yang bisa mengaktifkan transaksi.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if transaction.status != 'paid':
            return Response(
                {'error': 'Transaksi harus dalam status sudah dibayar.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        transaction.status = 'active'
        transaction.active_at = timezone.now()
        transaction.listing.status = 'borrowed'
        transaction.listing.save()
        transaction.save()
        Notification.objects.create(
            recipient=transaction.borrower,
            notification_type='confirmed',
            title='Barang Siap Diambil',
            message=f'Penyedia telah mengkonfirmasi barang "{transaction.listing.title}" siap diambil.',
            transaction=transaction,
        )
        return Response({'message': 'Transaksi aktif. Barang siap diambil.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Penyedia tolak pengajuan (FR-17)"""
        transaction = self.get_object()
        if transaction.listing.owner != request.user:
            return Response(
                {'error': 'Hanya penyedia yang bisa menolak.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if transaction.status != 'pending':
            return Response(
                {'error': 'Transaksi tidak dalam status menunggu konfirmasi.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        transaction.status = 'rejected'
        transaction.cancelled_at = timezone.now()
        transaction.save()
        Notification.objects.create(
            recipient=transaction.borrower,
            notification_type='rejected',
            title='Pengajuan Ditolak',
            message=f'Maaf, pengajuan peminjaman "{transaction.listing.title}" ditolak oleh penyedia.',
            transaction=transaction,
        )
        return Response({'message': 'Pengajuan berhasil ditolak.'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Penyewa batalkan pengajuan (FR-20)"""
        transaction = self.get_object()
        if transaction.borrower != request.user:
            return Response(
                {'error': 'Hanya penyewa yang bisa membatalkan.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if transaction.status not in ['pending', 'confirmed']:
            return Response(
                {'error': 'Transaksi tidak bisa dibatalkan.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        transaction.status = 'cancelled'
        transaction.cancellation_reason = request.data.get('reason', 'Dibatalkan oleh penyewa.')
        transaction.cancelled_at = timezone.now()
        transaction.save()
        Notification.objects.create(
            recipient=transaction.listing.owner,
            notification_type='cancelled',
            title='Peminjaman Dibatalkan',
            message=f'{transaction.borrower.full_name} membatalkan peminjaman "{transaction.listing.title}".',
            transaction=transaction,
        )
        return Response({'message': 'Transaksi berhasil dibatalkan.'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Penyedia konfirmasi pengembalian barang (FR-19)"""
        transaction = self.get_object()
        if transaction.listing.owner != request.user:
            return Response(
                {'error': 'Hanya penyedia yang bisa mengkonfirmasi pengembalian.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if transaction.status not in ['active', 'paid']:
            return Response(
                {'error': 'Transaksi tidak dalam status aktif atau sudah dibayar.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        transaction.status = 'completed'
        transaction.deposit_returned = True
        transaction.completed_at = timezone.now()
        transaction.listing.status = 'available'
        transaction.listing.save()
        transaction.save()
        Notification.objects.create(
            recipient=transaction.borrower,
            notification_type='completed',
            title='Transaksi Selesai',
            message=f'Transaksi peminjaman "{transaction.listing.title}" selesai. Deposit kamu telah dikembalikan.',
            transaction=transaction,
        )
        Notification.objects.create(
            recipient=transaction.listing.owner,
            notification_type='completed',
            title='Transaksi Selesai',
            message=f'Pengembalian "{transaction.listing.title}" telah dikonfirmasi. Pendapatan kamu: Rp {transaction.owner_earning}.',
            transaction=transaction,
        )
        return Response({'message': 'Transaksi selesai. Deposit dikembalikan ke penyewa.'})

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Beri rating setelah transaksi selesai (FR-26, FR-27)"""
        transaction = self.get_object()

        if transaction.status != 'completed':
            return Response(
                {'error': 'Hanya transaksi selesai yang bisa diberi ulasan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user == transaction.borrower:
            reviewee = transaction.listing.owner
        elif request.user == transaction.listing.owner:
            reviewee = transaction.borrower
        else:
            return Response(
                {'error': 'Kamu tidak terlibat dalam transaksi ini.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if Review.objects.filter(transaction=transaction, reviewer=request.user).exists():
            return Response(
                {'error': 'Kamu sudah memberikan ulasan untuk transaksi ini.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not rating:
            return Response(
                {'error': 'Rating wajib diisi.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            rating = int(rating)
            if not 1 <= rating <= 5:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {'error': 'Rating harus antara 1 sampai 5.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        Review.objects.create(
            transaction=transaction,
            reviewer=request.user,
            reviewee=reviewee,
            rating=rating,
            comment=comment,
        )

        return Response(
            {'message': 'Ulasan berhasil diberikan.'},
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def earnings_summary(self, request):
        """Ringkasan pendapatan user sebagai penyedia barang"""
        user = request.user

        completed_as_owner = Transaction.objects.filter(
            listing__owner=user,
            status='completed'
        )

        total_earnings = sum(
            float(t.owner_earning) for t in completed_as_owner
        )

        active_lending = Transaction.objects.filter(
            listing__owner=user,
            status__in=['confirmed', 'paid', 'active']
        ).count()

        return Response({
            'total_earnings': total_earnings,
            'completed_transactions': completed_as_owner.count(),
            'active_lending': active_lending,
        })


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(
            transaction__borrower=self.request.user
        )

    def perform_create(self, serializer):
        transaction = serializer.validated_data['transaction']

        amount = (
            transaction.total_rent +
            transaction.deposit_amount
        )

        payment = serializer.save(
            amount=amount,
            status='pending'
        )

        Notification.objects.create(
            recipient=transaction.listing.owner,
            notification_type='payment_uploaded',
            title='Bukti Pembayaran Dikirim',
            message=f'{transaction.borrower.full_name} telah mengupload bukti pembayaran.',
            transaction=transaction
        )

        return payment

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):

        if not request.user.is_staff:
            return Response(
                {'error': 'Hanya admin yang bisa verifikasi pembayaran.'},
                status=status.HTTP_403_FORBIDDEN
            )

        payment = Payment.objects.get(pk=pk)

        payment.status = 'success'
        payment.verified_at = timezone.now()
        payment.save()

        transaction = payment.transaction
        transaction.status = 'paid'
        transaction.paid_at = timezone.now()
        transaction.save()

        Notification.objects.create(
            recipient=transaction.borrower,
            notification_type='payment_received',
            title='Pembayaran Diverifikasi',
            message='Pembayaran berhasil diverifikasi admin.',
            transaction=transaction
        )

        return Response({
            'message': 'Pembayaran berhasil diverifikasi.'
        })