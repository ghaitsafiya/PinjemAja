from rest_framework import serializers
from .models import Listing, ListingPhoto, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']


class ListingPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingPhoto
        fields = ['id', 'photo', 'order']


class ListingSerializer(serializers.ModelSerializer):
    photos = ListingPhotoSerializer(many=True, read_only=True)
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    owner_id = serializers.UUIDField(source='owner.id', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'category', 'category_name', 'description',
            'condition', 'price_per_day', 'deposit_amount', 'status',
            'campus_location', 'latitude', 'longitude', 'is_active',
            'photos', 'uploaded_photos', 'owner_name', 'owner_id',
            'average_rating', 'total_reviews', 'created_at'
        ]
        read_only_fields = ['id', 'owner_name', 'owner_id', 'created_at']

    def get_average_rating(self, obj):
        return obj.average_rating

    def get_total_reviews(self, obj):
        from apps.transactions.models import Review
        return Review.objects.filter(
            transaction__listing=obj,
            reviewee=obj.owner
        ).count()

    def validate_uploaded_photos(self, value):
        if len(value) > 5:
            raise serializers.ValidationError('Maksimal 5 foto per listing.')
        return value

    def validate(self, attrs):
        price = attrs.get('price_per_day')
        deposit = attrs.get('deposit_amount')

        # Saat update, ambil nilai existing jika field tidak dikirim
        if price is None and self.instance is not None:
            price = self.instance.price_per_day
        if deposit is None and self.instance is not None:
            deposit = self.instance.deposit_amount

        if price is not None and deposit is not None:
            # Deposit maksimal = 10x harga sewa harian
            max_deposit = price * 10

            if deposit > max_deposit:
                raise serializers.ValidationError({
                    'deposit_amount': (
                        f'Deposit maksimal adalah 10x harga sewa harian '
                        f'(Rp {max_deposit:,.0f}). '
                        f'Jika barang bernilai sangat tinggi, sebaiknya '
                        f'sesuaikan harga sewa harian.'
                    )
                })

            if deposit < price:
                raise serializers.ValidationError({
                    'deposit_amount': (
                        'Deposit minimal sama dengan harga sewa harian.'
                    )
                })

        return attrs

    def create(self, validated_data):
        photos = validated_data.pop('uploaded_photos', [])
        listing = Listing.objects.create(**validated_data)
        for i, photo in enumerate(photos):
            ListingPhoto.objects.create(listing=listing, photo=photo, order=i)
        return listing

    def update(self, instance, validated_data):
        photos = validated_data.pop('uploaded_photos', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if photos:
            instance.photos.all().delete()
            for i, photo in enumerate(photos):
                ListingPhoto.objects.create(listing=instance, photo=photo, order=i)
        return instance