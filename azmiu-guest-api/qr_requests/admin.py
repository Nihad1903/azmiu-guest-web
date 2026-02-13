from django.contrib import admin

from .models import GuestQRRequest


@admin.register(GuestQRRequest)
class GuestQRRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'guest_name',
        'guest_surname',
        'guest_email',
        'status',
        'manager',
        'approved_by',
        'created_at',
    )
    list_filter = ('status', 'created_at')
    search_fields = ('guest_name', 'guest_surname', 'guest_email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('manager', 'approved_by')

    fieldsets = (
        ('Guest Information', {
            'fields': (
                'guest_name', 'guest_surname',
                'guest_email', 'guest_phone', 'remark',
            ),
        }),
        ('Status', {
            'fields': ('status', 'rejection_reason'),
        }),
        ('Workflow', {
            'fields': ('manager', 'approved_by', 'approved_at'),
        }),
        ('NOVUS Integration (Phase 2)', {
            'fields': (
                'novus_user_id', 'novus_card_id',
                'novus_credential_id', 'qr_number',
            ),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at'),
        }),
    )
