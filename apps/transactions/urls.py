from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, PaymentViewSet

router = DefaultRouter()
router.register('transactions', TransactionViewSet, basename='transaction')
router.register('payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]