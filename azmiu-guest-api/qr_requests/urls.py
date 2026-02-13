from django.urls import path

from . import views

app_name = 'qr_requests'

urlpatterns = [
    # Manager endpoints
    path(
        '',
        views.QRRequestCreateView.as_view(),
        name='create',
    ),
    path(
        'my/',
        views.QRRequestMyListView.as_view(),
        name='my-list',
    ),
    path(
        '<uuid:pk>/',
        views.QRRequestDeleteView.as_view(),
        name='delete',
    ),

    # SuperUser endpoints
    path(
        'all/',
        views.QRRequestAllListView.as_view(),
        name='all-list',
    ),
    path(
        'pending/',
        views.QRRequestPendingListView.as_view(),
        name='pending-list',
    ),
    path(
        '<uuid:pk>/approve/',
        views.QRRequestApproveView.as_view(),
        name='approve',
    ),
    path(
        '<uuid:pk>/reject/',
        views.QRRequestRejectView.as_view(),
        name='reject',
    ),

    # QR Code download (accessible by manager and superuser)
    path(
        '<uuid:pk>/qr-code/',
        views.QRCodeDownloadView.as_view(),
        name='qr-code-download',
    ),
]
