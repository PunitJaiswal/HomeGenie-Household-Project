class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = 'abcdefghijklmnopqrstuvwxyz'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///data.db' 
    SECURITY_PASSWORD_SALT = 'password-salt'
    
    # Configure Token
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    SECURITY_TOKEN_MAX_AGE = 3600
    SECURITY_LOGIN_WITHOUT_CONFIRMATION = True

    # Cache Config
    CACHE_TYPE = 'RedisCache'
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT = 6379

    # CSRF Protection settings
    WTF_CSRF_CHECK_DEFAULT = False
    SECURITY_CSRF_PROTECT_MECHANISMS = []
    SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS = True
