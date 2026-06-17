from django.contrib import admin
from .models import Category, Listing, ListingPhoto


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'created_at']
    search_fields = ['name']


class ListingPhotoInline(admin.TabularInline):
    model = ListingPhoto
    extra = 1
    max_num = 5


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'category', 'price_per_day', 'status', 'is_active', 'created_at']
    list_filter = ['status', 'category', 'is_active']
    search_fields = ['title', 'owner__email', 'owner__full_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ListingPhotoInline]

    actions = ['deactivate_listings', 'activate_listings']

    def deactivate_listings(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, 'Listing berhasil dinonaktifkan.')
    deactivate_listings.short_description = 'Nonaktifkan listing terpilih'

    def activate_listings(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, 'Listing berhasil diaktifkan.')
    activate_listings.short_description = 'Aktifkan listing terpilih'