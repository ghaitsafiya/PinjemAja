from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'

    def ready(self):
        import django
        from django.db import connection
        try:
            if connection.introspection.table_names():
                self.register_periodic_tasks()
        except Exception:
            pass

    def register_periodic_tasks(self):
        try:
            from django_celery_beat.models import PeriodicTask, CrontabSchedule
            import json

            schedule_morning, _ = CrontabSchedule.objects.get_or_create(
                minute='0',
                hour='7',
                day_of_week='*',
                day_of_month='*',
                month_of_year='*',
            )

            schedule_hourly, _ = CrontabSchedule.objects.get_or_create(
                minute='0',
                hour='*',
                day_of_week='*',
                day_of_month='*',
                month_of_year='*',
            )

            PeriodicTask.objects.get_or_create(
                name='Kirim Notifikasi Pengingat Pengembalian H-1',
                defaults={
                    'crontab': schedule_morning,
                    'task': 'apps.notifications.tasks.send_return_reminder',
                    'args': json.dumps([]),
                    'enabled': True,
                }
            )

            PeriodicTask.objects.get_or_create(
                name='Auto Cancel Pengajuan Expired 24 Jam',
                defaults={
                    'crontab': schedule_hourly,
                    'task': 'apps.notifications.tasks.auto_cancel_expired_requests',
                    'args': json.dumps([]),
                    'enabled': True,
                }
            )

            PeriodicTask.objects.get_or_create(
                name='Kirim Notifikasi Keterlambatan Pengembalian',
                defaults={
                    'crontab': schedule_morning,
                    'task': 'apps.notifications.tasks.send_late_return_notification',
                    'args': json.dumps([]),
                    'enabled': True,
                }
            )

        except Exception:
            pass