import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Kategori'
        verbose_name_plural = 'Kategori'
        ordering = ['name']

    def __str__(self):
        return self.name


class Listing(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Tersedia'
        UNAVAILABLE = 'unavailable', 'Tidak Tersedia'
        BORROWED = 'borrowed', 'Sedang Dipinjam'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='listings'
    )
    title = models.CharField(max_length=200)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='listings'
    )
    description = models.TextField()
    condition = models.TextField(help_text='Deskripsi kondisi barang saat ini')
    price_per_day = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    deposit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE
    )
    campus_location = models.CharField(max_length=200)
    latitude = models.DecimalField(
        max_digits=12,
        decimal_places=8,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=12,
        decimal_places=8,
        null=True,
        blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Listing Barang'
        verbose_name_plural = 'Listing Barang'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.owner.full_name}'

    @property
    def average_rating(self):
        from apps.transactions.models import Review
        reviews = Review.objects.filter(
            transaction__listing=self,
            reviewee=self.owner
        )
        if reviews.exists():
            total = sum(r.rating for r in reviews)
            return round(total / reviews.count(), 1)
        return None


class ListingPhoto(models.Model):
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    photo = models.ImageField(upload_to='listings/')
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Foto Listing'
        verbose_name_plural = 'Foto Listing'
        ordering = ['order']

    def __str__(self):
        return f'Foto {self.order} - {self.listing.title}'

    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.pk:
            count = ListingPhoto.objects.filter(listing=self.listing).count()
            if count >= 5:
                raise ValidationError('Maksimal 5 foto per listing.')