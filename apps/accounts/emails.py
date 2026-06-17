from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from .tokens import email_verification_token


def send_verification_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)

    # Build verification URL
    domain = request.get_host()
    scheme = 'https' if request.is_secure() else 'http'
    verification_url = f"{scheme}://{domain}/api/auth/verify-email/{uid}/{token}/"

    subject = 'Verifikasi Email PinjemAja'
    message = f"""
Halo {user.full_name},

Terima kasih telah mendaftar di PinjemAja!

Klik link berikut untuk mengaktifkan akun kamu:
{verification_url}

Link ini hanya berlaku sekali. Jika kamu tidak merasa mendaftar, abaikan email ini.

Salam,
Tim PinjemAja
    """

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_password_reset_email(user, request):
    from django.contrib.auth.tokens import default_token_generator
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    domain = request.get_host()
    scheme = 'https' if request.is_secure() else 'http'
    reset_url = f"{scheme}://{domain}/api/auth/reset-password/{uid}/{token}/"

    subject = 'Reset Password PinjemAja'
    message = f"""
Halo {user.full_name},

Kamu meminta reset password untuk akun PinjemAja kamu.

Klik link berikut untuk reset password:
{reset_url}

Link ini hanya berlaku 24 jam. Jika kamu tidak meminta reset password, abaikan email ini.

Salam,
Tim PinjemAja
    """

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )