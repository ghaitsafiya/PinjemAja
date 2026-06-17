from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Tampilkan email di console saat development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS — izinkan semua saat development
CORS_ALLOW_ALL_ORIGINS = True

# Django Debug Toolbar (opsional)
INTERNAL_IPS = ['127.0.0.1']