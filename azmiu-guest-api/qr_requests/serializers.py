import logging

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from accounts.serializers import UserBriefSerializer
from novus.exceptions import NovusError
from novus.services import provision_qr_for_request
from .models import GuestQRRequest

logger = logging.getLogger(__name__)


class GuestQRRequestCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = GuestQRRequest
        fields = (
            'id',
            'guest_name',
            'guest_surname',
            'guest_email',
            'guest_phone',
            'remark',
            'status',
            'manager',
            'created_at',
        )
        read_only_fields = ('id', 'status', 'manager', 'created_at')

    def create(self, validated_data):
        validated_data['manager'] = self.context['request'].user
        return super().create(validated_data)


class GuestQRRequestListSerializer(serializers.ModelSerializer):
    manager = UserBriefSerializer(read_only=True)
    approved_by = UserBriefSerializer(read_only=True)

    class Meta:
        model = GuestQRRequest
        fields = (
            'id',
            'guest_name',
            'guest_surname',
            'guest_email',
            'guest_phone',
            'remark',
            'status',
            'rejection_reason',
            'manager',
            'approved_by',
            'approved_at',
            'novus_user_id',
            'novus_card_id',
            'novus_credential_id',
            'qr_number',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class ApproveSerializer(serializers.Serializer):

    def validate(self, attrs):
        instance = self.instance
        if not instance:
            raise serializers.ValidationError('No QR request instance provided.')
        if instance.status != GuestQRRequest.Status.PENDING:
            raise serializers.ValidationError(
                f'Cannot approve a request with status "{instance.status}". '
                f'Only PENDING requests can be approved.'
            )
        return attrs

    def update(self, instance, validated_data):
        """
        Approve a QR request with full NOVUS provisioning.

        Everything runs inside a DB transaction:
          1. Provision QR in NOVUS (user → card → credential)
          2. Mark request as APPROVED with reviewer info
          3. Commit

        If NOVUS fails at any step the transaction rolls back,
        the status stays PENDING, and a clear error is raised.
        """
        try:
            with transaction.atomic():
                # NOVUS provisioning (creates user, card, credential).
                # On success, NOVUS IDs are saved to the instance inside
                # provision_qr_for_request via update_fields.
                provision_qr_for_request(instance)

                # Mark approved only after NOVUS succeeds.
                instance.status = GuestQRRequest.Status.APPROVED
                instance.approved_by = self.context['request'].user
                instance.approved_at = timezone.now()
                instance.save(update_fields=[
                    'status', 'approved_by', 'approved_at', 'updated_at',
                ])
        except NovusError as exc:
            logger.error(
                'NOVUS provisioning failed for QR request %s: %s',
                instance.pk, exc,
            )
            raise serializers.ValidationError(
                {'novus': f'NOVUS integration failed: {exc}'}
            ) from exc

        return instance


class RejectSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=True, min_length=1)

    def validate(self, attrs):
        instance = self.instance
        if not instance:
            raise serializers.ValidationError('No QR request instance provided.')
        if instance.status != GuestQRRequest.Status.PENDING:
            raise serializers.ValidationError(
                f'Cannot reject a request with status "{instance.status}". '
                f'Only PENDING requests can be rejected.'
            )
        return attrs

    def update(self, instance, validated_data):
        instance.status = GuestQRRequest.Status.REJECTED
        instance.rejection_reason = validated_data['rejection_reason']
        instance.approved_by = self.context['request'].user
        instance.approved_at = timezone.now()
        instance.save(update_fields=[
            'status', 'rejection_reason', 'approved_by', 'approved_at',
            'updated_at',
        ])
        return instance
