import jwt
import base64
from django.core.cache import caches
from jwt import InvalidTokenError

from rest_framework import authentication
from rest_framework import exceptions

from fv.api.models.user import User

cache = caches['jwks']


class UserAuthentication(authentication.BaseAuthentication):
    """
    Class to handle authentication when after logging into keycloak
    """

    def _get_keys(self):
        """
        Assemble a list of valid signing public keys we use to verify the token
        """
        decoded_keys = {}

        decoded_keys['fvhmackey1'] = base64.b64decode('b0Dd1pxJp+pIGA4uqNgNdtQw9N7DaD1F9BSum9QTBMc=')

        return decoded_keys

    def authenticate(self, request):
        """Verify the JWT and find or create the correct user in the DB"""

        auth = request.META.get('HTTP_AUTHORIZATION', None)

        if not auth:
            raise exceptions.AuthenticationFailed(
                'Authorization header required')

        try:
            scheme, token = auth.split()

        except ValueError:
            raise exceptions.AuthenticationFailed(
                'Invalid format for authorization header')

        if scheme != 'Bearer':
            raise exceptions.AuthenticationFailed(
                'Authorization header invalid'
            )

        if not token:
            raise exceptions.AuthenticationFailed(
                'No token found'
            )

        user_token = None
        token_validation_errors = []

        keys = self._get_keys().items()

        if len(keys) == 0:
            raise exceptions.AuthenticationFailed(
                'no keys available for verification')

        for _kid, key in keys:
            try:
                user_token = jwt.decode(token,
                                        key=key,
                                        issuer='firstvoices',
                                        algorithms=['HS256', 'HS384', 'HS512'])
                break
            except InvalidTokenError as error:
                token_validation_errors.append(error)

        if not user_token:
            raise exceptions.AuthenticationFailed(
                'No successful decode of user token. Exceptions occurred: {errors}'
                    .format(errors=','.join([str(error) for error in token_validation_errors])),
            )

        user_found_via_email = None
        username = user_token['sub'] if 'sub' in user_token else None
        if username is None:
            raise exceptions.AuthenticationFailed(
                'User (subject) not present in token'
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            user = User(username=username)
            user.save()

        return user, None
