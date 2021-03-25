from django.db import models


class User(models.Model):

    username = models.CharField(unique=True, primary_key=True, max_length=100)

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_authenticated(self):
        return True

    REQUIRED_FIELDS = ()
    USERNAME_FIELD = 'username'
