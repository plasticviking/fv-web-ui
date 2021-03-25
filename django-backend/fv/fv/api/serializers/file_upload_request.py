from minio import Minio
from rest_framework import serializers

from fv.api.models.file_upload_request import FileUploadRequest, ProcessingStatus
from fv.settings import MINIO


class FileUploadRequestSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=ProcessingStatus,
                                     read_only=True)

    class Meta:
        model = FileUploadRequest
        fields = ('id', 'user', 'created_at', 'filename', 'minio_id', 'status')
        read_only_fields = ('id', 'user', 'created_at', 'minio_id',
                            'status')


class FileUploadRequestNuxeoURLSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=ProcessingStatus,
                                     read_only=True)

    url = serializers.SerializerMethodField()

    def get_url(self, obj):
        minio = Minio(MINIO['ENDPOINT'],
                      access_key=MINIO['ACCESS_KEY'],
                      secret_key=MINIO['SECRET_KEY'],
                      secure=MINIO['USE_SSL'])

        get_url = minio.presigned_get_object(
            bucket_name=MINIO['BUCKET_NAME'],
            object_name=obj.minio_id,
            expires=MINIO['EXPIRY'])

        return get_url

    class Meta:
        model = FileUploadRequest
        fields = ('id', 'status', 'url')
        read_only_fields = ('id', 'status', 'url')


class FileUploadRequestCreateSerializer(serializers.ModelSerializer):
    filename = serializers.CharField(allow_blank=False)
    status = serializers.ChoiceField(choices=ProcessingStatus,
                                     read_only=True)

    object_urls = serializers.SerializerMethodField()

    def get_object_urls(self, obj):
        minio = Minio(MINIO['ENDPOINT'],
                      access_key=MINIO['ACCESS_KEY'],
                      secret_key=MINIO['SECRET_KEY'],
                      secure=MINIO['USE_SSL'])

        put_url = minio.presigned_put_object(
            bucket_name=MINIO['BUCKET_NAME'],
            object_name=obj.minio_id,
            expires=MINIO['EXPIRY'])

        get_url = minio.presigned_get_object(
            bucket_name=MINIO['BUCKET_NAME'],
            object_name=obj.minio_id,
            expires=MINIO['EXPIRY'])

        return {
            'get': get_url,
            'put': put_url
        }


    def create(self, validated_data):
        model = FileUploadRequest.objects.create(**validated_data)
        return model

    def save(self, **kwargs):
        super().save(**kwargs)
        model = self.instance
        return model

    class Meta:
        model = FileUploadRequest
        fields = ('id', 'user', 'created_at', 'filename', 'object_urls', 'status')
        read_only_fields = ('id', 'user', 'created_at', 'object_urls', 'status')
