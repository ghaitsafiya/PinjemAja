import uuid
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        BORROW_REQUEST = 'borrow_request', 'Pengajuan Peminjaman'
        CONFIRMED = 'confirmed', 'Pengajuan Dikonfirmasi'
        REJECTED = 'rejected', 'Pengajuan Ditolak'
        PAYMENT_RECEIVED = 'payment_received', 'Pembayaran Diterima'
        ITEM_PICKED_UP = 'item_picked_up', 'Barang Diambil'
        RETURN_REMINDER = 'return_reminder', 'Pengingat Pengembalian'
        ITEM_RETURNED = 'item_returned', 'Barang Dikembalikan'
        COMPLETED = 'completed', 'Transaksi Selesai'
        DEPOSIT_RETURNED = 'deposit_returned', 'Deposit Dikembalikan'
        CANCELLED = 'cancelled', 'Transaksi Dibatalkan'
        LATE_RETURN = 'late_return', 'Keterlambatan Pengembalian'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=30,
        choices=Type.choices
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    transaction = models.ForeignKey(
        'transactions.Transaction',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notifikasi'
        verbose_name_plural = 'Notifikasi'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.recipient.full_name} - {self.title}'

    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])