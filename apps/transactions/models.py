import uuid
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError


class Transaction(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Menunggu Konfirmasi'
        CONFIRMED = 'confirmed', 'Dikonfirmasi Penyedia'
        PAID = 'paid', 'Sudah Dibayar'
        ACTIVE = 'active', 'Sedang Berlangsung'
        COMPLETED = 'completed', 'Selesai'
        CANCELLED = 'cancelled', 'Dibatalkan'
        REJECTED = 'rejected', 'Ditolak Penyedia'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        'listings.Listing',
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    borrower = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='borrowed_transactions'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    duration_days = models.PositiveIntegerField(editable=False)
    total_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False
    )
    deposit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False
    )
    platform_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False
    )
    owner_earning = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    deposit_returned = models.BooleanField(default=False)
    cancellation_reason = models.TextField(blank=True)

    # Timestamps setiap tahap
    confirmed_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    active_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Transaksi'
        verbose_name_plural = 'Transaksi'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.borrower.full_name} → {self.listing.title} ({self.status})'

    def clean(self):
        if self.start_date and self.end_date:
            if self.end_date <= self.start_date:
                raise ValidationError('Tanggal selesai harus setelah tanggal mulai.')

    def save(self, *args, **kwargs):
        if self.start_date and self.end_date:
            self.duration_days = (self.end_date - self.start_date).days
            self.total_rent = self.listing.price_per_day * self.duration_days
            self.deposit_amount = self.listing.deposit_amount
            self.platform_fee = self.total_rent * Decimal('0.10')
            self.owner_earning = self.total_rent - self.platform_fee
        super().save(*args, **kwargs)


class Payment(models.Model):
    class Method(models.TextChoices):
        QRIS = 'qris', 'QRIS'
        TRANSFER = 'transfer', 'Transfer Bank'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Menunggu'
        SUCCESS = 'success', 'Berhasil'
        FAILED = 'failed', 'Gagal'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.PROTECT,
        related_name='payment'
    )
    method = models.CharField(max_length=20, choices=Method.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    payment_proof = models.ImageField(
        upload_to='payments/',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Pembayaran'
        verbose_name_plural = 'Pembayaran'

    def __str__(self):
        return f'Payment {self.transaction} - {self.status}'


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reviews_given'
    )
    reviewee = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reviews_received'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    is_reported = models.BooleanField(default=False)
    report_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Ulasan'
        verbose_name_plural = 'Ulasan'
        ordering = ['-created_at']
        unique_together = ['transaction', 'reviewer']

    def __str__(self):
        return f'{self.reviewer.full_name} → {self.reviewee.full_name} ({self.rating}★)'