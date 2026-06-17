from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.listings.models import Category, Listing
from decimal import Decimal

User = get_user_model()

class ListingsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@mhs.dinus.ac.id',
            full_name='Test User',
            password='StrongPassword123!',
            email_verified=True,
            is_active=True
        )
        self.category = Category.objects.create(name='Electronics')

    def test_create_listing_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = '/api/listings/'
        data = {
            'title': 'Test Item',
            'category': self.category.id,
            'description': 'Description',
            'condition': 'New',
            'price_per_day': 10000,
            'deposit_amount': 20000,
            'campus_location': 'Campus A'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_listing_unauthenticated(self):
        url = '/api/listings/'
        data = {'title': 'Test Item'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_deposit_validation(self):
        self.client.force_authenticate(user=self.user)
        url = '/api/listings/'
        # Deposit too high (more than 50x)
        data = {
            'title': 'Test Item',
            'category': self.category.id,
            'description': 'Description',
            'condition': 'New',
            'price_per_day': 1000,
            'deposit_amount': 100000, # 100x
            'campus_location': 'Campus A'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('deposit_amount', response.data)
