from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'university_domain', 'email_verified', 'is_active', 'created_at']
    list_filter = ['is_active', 'email_verified', 'is_staff']
    search_fields = ['email', 'full_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Info Pribadi', {'fields': ('full_name', 'phone_whatsapp', 'photo', 'bio')}),
        ('Status', {'fields': ('is_active', 'is_staff', 'is_superuser', 'email_verified')}),
        ('Waktu', {'fields': ('created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2'),
        }),
    )