from rest_framework import serializers
from django.utils import timezone
from .models import Transaction, Payment, Review


class TransactionSerializer(serializers.ModelSerializer):
    borrower_name = serializers.CharField(
        source='borrower.full_name',
        read_only=True
    )

    listing_title = serializers.CharField(
        source='listing.title',
        read_only=True
    )

    listing_owner = serializers.CharField(
        source='listing.owner.full_name',
        read_only=True
    )

    listing_owner_id = serializers.UUIDField(
        source='listing.owner.id',
        read_only=True
    )

    payment_id = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

    def get_payment_id(self, obj):
        payment = Payment.objects.filter(transaction=obj).first()
        return str(payment.id) if payment else None

    def get_payment_status(self, obj):
        payment = Payment.objects.filter(transaction=obj).first()
        return payment.status if payment else None

    class Meta:
        model = Transaction
        fields = [
            'id',
            'listing',
            'listing_title',
            'listing_owner',
            'listing_owner_id',

            'payment_id',
            'payment_status',

            'borrower',
            'borrower_name',
            'start_date',
            'end_date',
            'duration_days',
            'total_rent',
            'deposit_amount',
            'platform_fee',
            'owner_earning',
            'status',
            'deposit_returned',
            'cancellation_reason',
            'confirmed_at',
            'paid_at',
            'active_at',
            'completed_at',
            'cancelled_at',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'borrower',
            'duration_days',
            'total_rent',
            'deposit_amount',
            'platform_fee',
            'owner_earning',
            'status',
            'deposit_returned',
            'confirmed_at',
            'paid_at',
            'active_at',
            'completed_at',
            'cancelled_at',
            'created_at'
        ]

    def validate(self, attrs):
        listing = attrs.get('listing')
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        overlap = Transaction.objects.filter(
            listing=listing,
            status__in=[
                'pending',
                'confirmed',
                'paid',
                'active'
            ],
            start_date__lt=end_date,
            end_date__gt=start_date
        ).exists()

        if overlap:
            raise serializers.ValidationError(
                'Barang sudah dibooking pada tanggal tersebut.'
            )

        if start_date and end_date:
            if end_date <= start_date:
                raise serializers.ValidationError(
                    'Tanggal selesai harus setelah tanggal mulai.'
                )

            if start_date < timezone.now().date():
                raise serializers.ValidationError(
                    'Tanggal mulai tidak boleh di masa lalu.'
                )

        if listing and listing.status != 'available':
            raise serializers.ValidationError(
                'Barang tidak tersedia untuk dipinjam.'
            )

        if listing and self.context['request'].user == listing.owner:
            raise serializers.ValidationError(
                'Kamu tidak bisa meminjam barang milikmu sendiri.'
            )

        return attrs


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'transaction',
            'method',
            'amount',
            'status',
            'payment_proof',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'amount',
            'status',
            'created_at'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(
        source='reviewer.full_name',
        read_only=True
    )

    reviewee_name = serializers.CharField(
        source='reviewee.full_name',
        read_only=True
    )

    class Meta:
        model = Review
        fields = [
            'id',
            'transaction',
            'reviewer',
            'reviewer_name',
            'reviewee',
            'reviewee_name',
            'rating',
            'comment',
            'is_reported',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'reviewer',
            'is_reported',
            'created_at'
        ]

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError(
                'Rating harus antara 1 sampai 5.'
            )
        return value