from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import LoginView, TokenAuthView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/qr-requests/', include('qr_requests.urls')),
    
    # Auth endpoints
    path('api/auth/', TokenAuthView.as_view(), name='token_auth'),  # GET with Basic Auth
    path('api/auth/login/', LoginView.as_view(), name='login'),      # POST with body
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
