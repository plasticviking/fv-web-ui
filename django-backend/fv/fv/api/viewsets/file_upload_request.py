import uuid

from django.db.models import Q
from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response

from fv.api.models.file_upload_request import FileUploadRequest
from fv.api.serializers.file_upload_request import FileUploadRequestSerializer, FileUploadRequestCreateSerializer, \
    FileUploadRequestNuxeoURLSerializer


class UploadRequestViewSet(mixins.ListModelMixin,
                           mixins.RetrieveModelMixin,
                           mixins.CreateModelMixin,
                           viewsets.GenericViewSet):
    queryset = FileUploadRequest.objects.all()
    ordering = ('-created_at',)
    serializer_classes = {
        'default': FileUploadRequestSerializer,
        'nuxeo_url': FileUploadRequestNuxeoURLSerializer,
        'create': FileUploadRequestCreateSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def get_queryset(self):
        user = self.request.user

        return self.queryset.filter(
            Q(user=user)
        ).all()

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(
            user=user,
            minio_id=uuid.uuid4().hex
        )

    @action(detail=True, methods=['get'])
    def nuxeo_url(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
