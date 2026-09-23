from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, Token
from app.utils.security import hash_password, verify_password, create_access_token
from fastapi import HTTPException, status


class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserRegister) -> User:
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )
        
        hashed_pwd = hash_password(user_in.password)
        db_user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=hashed_pwd,
            role=user_in.role or "Analyst",
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, credentials: UserLogin) -> Token:
        user = db.query(User).filter(User.email == credentials.email).first()
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user account")

        access_token = create_access_token(subject=user.id)
        return Token(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role
        )


auth_service = AuthService()
