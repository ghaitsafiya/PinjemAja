from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from .serializers import RegisterSerializer, UserProfileSerializer, ChangePasswordSerializer
from .tokens import email_verification_token
from .emails import send_verification_email, send_password_reset_email

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Kirim email verifikasi
        try:
            send_verification_email(user, request)
            email_sent = True
        except Exception:
            email_sent = False

        return Response({
            'message': 'Registrasi berhasil! Silakan cek email untuk verifikasi akun.',
            'email_sent': email_sent,
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Link verifikasi tidak valid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.email_verified:
            return Response({'message': 'Email sudah diverifikasi sebelumnya.'})

        if email_verification_token.check_token(user, token):
            user.email_verified = True
            user.is_active = True
            user.save()
            return Response({'message': 'Email berhasil diverifikasi! Akun kamu sekarang aktif.'})
        else:
            return Response(
                {'error': 'Link verifikasi tidak valid atau sudah kadaluarsa.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email wajib diisi.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Email tidak ditemukan.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.email_verified:
            return Response({'message': 'Email sudah diverifikasi.'})

        try:
            send_verification_email(user, request)
            return Response({'message': 'Email verifikasi berhasil dikirim ulang.'})
        except Exception as e:
            return Response(
                {'error': 'Gagal mengirim email. Coba lagi nanti.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email wajib diisi.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email, is_active=True)
            send_password_reset_email(user, request)
        except User.DoesNotExist:
            pass  # Jangan beri tahu apakah email ada atau tidak (security)

        return Response({
            'message': 'Jika email terdaftar, link reset password akan dikirim.'
        })


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Link reset password tidak valid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Link reset password tidak valid atau sudah kadaluarsa.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_password = request.data.get('new_password')
        new_password2 = request.data.get('new_password2')

        if not new_password or not new_password2:
            return Response(
                {'error': 'Password baru wajib diisi.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != new_password2:
            return Response(
                {'error': 'Password tidak cocok.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password berhasil direset. Silakan login.'})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password berhasil diubah.'})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout berhasil.'})
        except Exception:
            return Response(
                {'error': 'Token tidak valid.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class PublicProfileView(generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]