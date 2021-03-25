from rest_framework.routers import DefaultRouter

from fv.api.viewsets.file_upload_request import UploadRequestViewSet

ROUTER = DefaultRouter(trailing_slash=False)
ROUTER.register(r'uploads', UploadRequestViewSet)

urlpatterns = ROUTER.urls
