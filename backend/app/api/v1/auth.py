from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import UserRegister, UserLogin, Token, UserOut
from app.services.auth_service import auth_service
from app.api.deps import get_required_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new user analyst/admin in VOCX AI platform."""
    return auth_service.register_user(db, user_in)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    return auth_service.authenticate_user(db, credentials)


@router.post("/token", response_model=Token)
def login_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible token login."""
    credentials = UserLogin(email=form_data.username, password=form_data.password)
    return auth_service.authenticate_user(db, credentials)


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_required_user)):
    """Get details of the currently authenticated user."""
    return current_user
