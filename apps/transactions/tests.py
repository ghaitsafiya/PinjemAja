from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.listings.models import Category, Listing
from apps.transactions.models import Transaction
from datetime import date, timedelta

User = get_user_model()

class TransactionsTests(APITestCase):
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

    def test_create_transaction(self):
        self.client.force_authenticate(user=self.borrower)
        url = '/api/transactions/'
        data = {
            'listing': self.listing.id,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=2)
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'pending')

    def test_confirm_only_by_owner(self):
        tx = Transaction.objects.create(
            listing=self.listing,
            borrower=self.borrower,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=2)
        )
        url = f'/api/transactions/{tx.id}/confirm/'

        # Test by borrower (should fail)
        self.client.force_authenticate(user=self.borrower)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test by owner (should succeed)
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tx.refresh_from_db()
        self.assertEqual(tx.status, 'confirmed')

    def test_invalid_transition(self):
        tx = Transaction.objects.create(
            listing=self.listing,
            borrower=self.borrower,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=2)
        )
        # Try to complete while pending
        url = f'/api/transactions/{tx.id}/complete/'
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
