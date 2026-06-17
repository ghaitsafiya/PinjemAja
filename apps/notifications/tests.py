from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.listings.models import Category, Listing
from apps.transactions.models import Transaction
from apps.notifications.models import Notification
from datetime import date, timedelta

User = get_user_model()

class NotificationsTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email='owner@mhs.dinus.ac.id',
            full_name='Owner',
            password='StrongPassword123!',
            email_verified=True,
            is_active=True
        )
        self.borrower = User.objects.create_user(
            email='borrower@mhs.dinus.ac.id',
            full_name='Borrower',
            password='StrongPassword123!',
            email_verified=True,
            is_active=True
        )
        self.category = Category.objects.create(name='Electronics')
        self.listing = Listing.objects.create(
            owner=self.owner,
            title='Test Item',
            category=self.category,
            price_per_day=10000,
            deposit_amount=20000,
            campus_location='Campus A'
        )

    def test_notification_on_transaction_create(self):
        self.client.force_authenticate(user=self.borrower)
        url = '/api/transactions/'
        data = {
            'listing': self.listing.id,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=2)
        }
        self.client.post(url, data)

        self.assertTrue(Notification.objects.filter(
            recipient=self.owner,
            notification_type='borrow_request'
        ).exists())

    def test_notification_on_confirm(self):
        tx = Transaction.objects.create(
            listing=self.listing,
            borrower=self.borrower,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=2)
        )
        self.client.force_authenticate(user=self.owner)
        url = f'/api/transactions/{tx.id}/confirm/'
        self.client.post(url)

        self.assertTrue(Notification.objects.filter(
            recipient=self.borrower,
            notification_type='confirmed'
        ).exists())
