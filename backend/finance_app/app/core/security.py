from datetime import datetime, timedelta
from jose import jwt
from passlib.hash import pbkdf2_sha256

from backend.finance_app.app.core.config import settings


def hash_password(password: str) -> str:
    return pbkdf2_sha256.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pbkdf2_sha256.verify(password, hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    print(33, to_encode)
    expire = datetime.now() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    print(44, to_encode)
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)