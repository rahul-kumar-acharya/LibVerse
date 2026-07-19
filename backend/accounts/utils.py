from django.conf import settings

def set_jwt_cookies(response, access_token=None, refresh_token=None):
    """
    Centralized helper to set HttpOnly access and refresh token cookies on a Django
    Response object. Dynamically resolves max_age from SIMPLE_JWT settings, and 
    removes raw tokens from the response JSON body to prevent storage leakage on the client.
    """
    cookie_domain = getattr(settings, 'JWT_COOKIE_DOMAIN', None)
    cookie_samesite = getattr(settings, 'JWT_COOKIE_SAMESITE', 'Lax')

    # 1. Handle Access Token Cookie
    if access_token:
        try:
            access_lifetime = int(settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds())
        except (AttributeError, TypeError, KeyError):
            access_lifetime = 900  # 15 minutes default fallback
            
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite=cookie_samesite,
            path='/',
            max_age=access_lifetime,
            domain=cookie_domain
        )
        # Clean up response body JSON
        if isinstance(response.data, dict) and 'access' in response.data:
            del response.data['access']

    # 2. Handle Refresh Token Cookie
    if refresh_token:
        try:
            refresh_lifetime = int(settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME').total_seconds())
        except (AttributeError, TypeError, KeyError):
            refresh_lifetime = 604800  # 7 days default fallback
            
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite=cookie_samesite,
            path='/',
            max_age=refresh_lifetime,
            domain=cookie_domain
        )
        # Clean up response body JSON
        if isinstance(response.data, dict) and 'refresh' in response.data:
            del response.data['refresh']
            
    return response
