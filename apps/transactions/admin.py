from django.contrib import admin
from .models import Transaction, Payment, Review


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'borrower', 'listing', 'start_date', 'end_date', 'total_rent', 'status', 'created_at']
    list_filter = ['status', 'deposit_returned']
    search_fields = ['borrower__email', 'borrower__full_name', 'listing__title']
    ordering = ['-created_at']
    readonly_fields = [
        'id', 'duration_days', 'total_rent', 'deposit_amount',
        'platform_fee', 'owner_earning', 'created_at', 'updated_at',
        'confirmed_at', 'paid_at', 'active_at', 'completed_at', 'cancelled_at'
    ]

    fieldsets = (
        ('Info Transaksi', {'fields': ('id', 'listing', 'borrower', 'status')}),
        ('Jadwal', {'fields': ('start_date', 'end_date', 'duration_days')}),
        ('Keuangan', {'fields': ('total_rent', 'deposit_amount', 'platform_fee', 'owner_earning', 'deposit_returned')}),
        ('Pembatalan', {'fields': ('cancellation_reason',)}),
        ('Timestamps', {'fields': ('created_at', 'confirmed_at', 'paid_at', 'active_at', 'completed_at', 'cancelled_at')}),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'transaction', 'method', 'amount', 'status', 'created_at']
    list_filter = ['method', 'status']
    search_fields = ['transaction__borrower__email']
    readonly_fields = ['created_at', 'verified_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'reviewee', 'rating', 'is_reported', 'created_at']
    list_filter = ['rating', 'is_reported']
    search_fields = ['reviewer__email', 'reviewee__email']
    readonly_fields = ['created_at']

    actions = ['hapus_ulasan_dilaporkan']

    def hapus_ulasan_dilaporkan(self, request, queryset):
        queryset.filter(is_reported=True).delete()
        self.message_user(request, 'Ulasan yang dilaporkan berhasil dihapus.')
    hapus_ulasan_dilaporkan.short_description = 'Hapus ulasan yang dilaporkan'