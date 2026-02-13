import io

import qrcode
from django.http import HttpResponse
from rest_framework import status
from rest_framework.generics import CreateAPIView, GenericAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsManager, IsSuperUser
from .models import GuestQRRequest
from .serializers import (
    ApproveSerializer,
    GuestQRRequestCreateSerializer,
    GuestQRRequestListSerializer,
    RejectSerializer,
)


# ── Manager Endpoints ────────────────────────────────────────────────


class QRRequestCreateView(CreateAPIView):
    """POST /api/qr-requests/ — Manager creates a new QR request."""

    serializer_class = GuestQRRequestCreateSerializer
    permission_classes = [IsManager]


class QRRequestMyListView(ListAPIView):
    """GET /api/qr-requests/my/ — Manager sees their own QR requests."""

    serializer_class = GuestQRRequestListSerializer
    permission_classes = [IsManager]

    def get_queryset(self):
        return GuestQRRequest.objects.filter(manager=self.request.user)


class QRRequestDeleteView(GenericAPIView):
    """DELETE /api/qr-requests/{id}/ — Manager deletes own PENDING request."""

    permission_classes = [IsManager]
    lookup_field = 'pk'

    def get_queryset(self):
        return GuestQRRequest.objects.filter(manager=self.request.user)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.is_pending:
            return Response(
                {'detail': 'Only PENDING requests can be deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── SuperUser Endpoints ──────────────────────────────────────────────


class QRRequestAllListView(ListAPIView):
    """GET /api/qr-requests/all/ — SuperUser sees all requests."""

    serializer_class = GuestQRRequestListSerializer
    permission_classes = [IsSuperUser]
    queryset = GuestQRRequest.objects.all()


class QRRequestPendingListView(ListAPIView):
    """GET /api/qr-requests/pending/ — SuperUser sees all pending requests."""

    serializer_class = GuestQRRequestListSerializer
    permission_classes = [IsSuperUser]

    def get_queryset(self):
        return GuestQRRequest.objects.filter(
            status=GuestQRRequest.Status.PENDING,
        )


class QRRequestApproveView(GenericAPIView):
    """POST /api/qr-requests/{id}/approve/ — SuperUser approves a request."""

    permission_classes = [IsSuperUser]
    lookup_field = 'pk'
    queryset = GuestQRRequest.objects.all()

    def post(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ApproveSerializer(
            instance=instance,
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(
            GuestQRRequestListSerializer(updated).data,
            status=status.HTTP_200_OK,
        )


class QRRequestRejectView(GenericAPIView):
    """POST /api/qr-requests/{id}/reject/ — SuperUser rejects a request."""

    permission_classes = [IsSuperUser]
    serializer_class = RejectSerializer
    lookup_field = 'pk'
    queryset = GuestQRRequest.objects.all()

    def post(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = RejectSerializer(
            instance=instance,
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(
            GuestQRRequestListSerializer(updated).data,
            status=status.HTTP_200_OK,
        )


class QRCodeDownloadView(APIView):
    """GET /api/qr-requests/{id}/qr-code/ — Download QR code image for approved request."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            qr_request = GuestQRRequest.objects.get(pk=pk)
        except GuestQRRequest.DoesNotExist:
            return Response(
                {'detail': 'QR request not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check access: either the manager who created it or a superuser
        user = request.user
        if qr_request.manager != user and user.role != 'SUPERUSER':
            return Response(
                {'detail': 'You do not have permission to access this QR code.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Only approved requests with QR numbers can download
        if qr_request.status != GuestQRRequest.Status.APPROVED:
            return Response(
                {'detail': 'QR code is only available for approved requests.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not qr_request.qr_number:
            return Response(
                {'detail': 'QR number has not been generated yet.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate QR code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_request.qr_number)
        qr.make(fit=True)

        img = qr.make_image(fill_color='black', back_color='white')

        # Write image to bytes buffer
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        # Create response with image
        filename = f"qr_{qr_request.guest_name}_{qr_request.guest_surname}.png"
        response = HttpResponse(buffer.getvalue(), content_type='image/png')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
