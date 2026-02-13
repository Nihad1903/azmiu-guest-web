import uuid

from django.conf import settings
from django.db import models


class GuestQRRequest(models.Model):

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    # Requesting manager
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='qr_requests',
    )

    # Guest information
    guest_name = models.CharField(max_length=150)
    guest_surname = models.CharField(max_length=150)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=20, blank=True, default='')
    remark = models.TextField(blank=True, default='')

    # Status management
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    rejection_reason = models.TextField(blank=True, default='')
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_qr_requests',
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    # NOVUS fields (Phase 2 — nullable for now)
    novus_user_id = models.CharField(
        max_length=100, null=True, blank=True, default=None,
    )
    novus_card_id = models.CharField(
        max_length=100, null=True, blank=True, default=None,
    )
    novus_credential_id = models.CharField(
        max_length=100, null=True, blank=True, default=None,
    )
    qr_number = models.CharField(
        max_length=100, null=True, blank=True, default=None,
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'qr_requests_guestqrrequest'
        ordering = ['-created_at']
        verbose_name = 'Guest QR Request'
        verbose_name_plural = 'Guest QR Requests'

    def __str__(self):
        return f'QR Request for {self.guest_name} {self.guest_surname} ({self.status})'

    @property
    def is_pending(self):
        return self.status == self.Status.PENDING
