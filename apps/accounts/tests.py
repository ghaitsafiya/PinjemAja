from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AccountsTests(APITestCase):
    def test_register_ac_id(self):
        url = '/api/auth/register/'
        data = {
            'email': 'test@mhs.dinus.ac.id',
            'full_name': 'Test User',
            'password': 'StrongPassword123!',
            'password2': 'StrongPassword123!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_non_ac_id(self):
        url = '/api/auth/register/'
        data = {
            'email': 'test@gmail.com',
            'full_name': 'Test User',
            'password': 'StrongPassword123!',
            'password2': 'StrongPassword123!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login(self):
        user = User.objects.create_user(
            email='test@mhs.dinus.ac.id',
            full_name='Test User',
            password='StrongPassword123!',
            email_verified=True,
            is_active=True
        )
        url = '/api/auth/login/'
        data = {'email': 'test@mhs.dinus.ac.id', 'password': 'StrongPassword123!'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
