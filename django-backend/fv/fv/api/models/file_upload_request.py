from django.db import models

from fv.api.models.user import User

ProcessingStatus = [
    ('NEW', 'NEW'),
    ('PENDING', 'PENDING'),
    ('PROCESSING', 'PROCESSING'),
    ('COMPLETE', 'COMPLETE'),
    ('ERROR', 'ERROR')
]


class FileUploadRequest(models.Model):
    created_at = models.DateTimeField(auto_created=True, auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    filename = models.CharField(max_length=1024, null=False)
    minio_id = models.CharField(max_length=40, null=False)
    status = models.CharField(choices=ProcessingStatus, max_length=10,
                              null=False, default='NEW')
