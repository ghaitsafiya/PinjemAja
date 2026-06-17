from celery import shared_task
from django.utils import timezone
from datetime import timedelta


@shared_task
def send_return_reminder():
    """Kirim notifikasi pengingat H-1 pengembalian (FR-32)"""
    from apps.transactions.models import Transaction
    from apps.notifications.models import Notification

    tomorrow = timezone.now().date() + timedelta(days=1)
    active_transactions = Transaction.objects.filter(
        status='active',
        end_date=tomorrow
    ).select_related('borrower', 'listing')

    for txn in active_transactions:
        Notification.objects.create(
            recipient=txn.borrower,
            notification_type='return_reminder',
            title='Pengingat Pengembalian Barang',
            message=f'Barang "{txn.listing.title}" harus dikembalikan besok ({txn.end_date}). Pastikan barang dalam kondisi baik sebelum dikembalikan.',
            transaction=txn,
        )


@shared_task
def send_late_return_notification():
    """Kirim notifikasi keterlambatan pengembalian"""
    from apps.transactions.models import Transaction
    from apps.notifications.models import Notification

    today = timezone.now().date()
    late_transactions = Transaction.objects.filter(
        status='active',
        end_date__lt=today
    ).select_related('borrower', 'listing')

    for txn in late_transactions:
        days_late = (today - txn.end_date).days
        Notification.objects.create(
            recipient=txn.borrower,
            notification_type='late_return',
            title='Keterlambatan Pengembalian Barang',
            message=f'Barang "{txn.listing.title}" sudah terlambat {days_late} hari. Segera kembalikan untuk menghindari denda tambahan.',
            transaction=txn,
        )


@shared_task
def auto_cancel_expired_requests():
    """Batalkan pengajuan yang tidak direspons dalam 24 jam"""
    from apps.transactions.models import Transaction
    from apps.notifications.models import Notification

    deadline = timezone.now() - timedelta(hours=24)
    expired = Transaction.objects.filter(
        status='pending',
        created_at__lte=deadline
    ).select_related('borrower', 'listing')

    for txn in expired:
        txn.status = 'cancelled'
        txn.cancellation_reason = 'Otomatis dibatalkan karena penyedia tidak merespons dalam 24 jam.'
        txn.cancelled_at = timezone.now()
        txn.save()

        Notification.objects.create(
            recipient=txn.borrower,
            notification_type='cancelled',
            title='Pengajuan Dibatalkan Otomatis',
            message=f'Pengajuan peminjaman "{txn.listing.title}" dibatalkan karena penyedia tidak merespons dalam 24 jam.',
            transaction=txn,
        )