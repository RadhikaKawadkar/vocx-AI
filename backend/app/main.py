import uvicorn
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, SessionLocal, get_db
from app.api.v1.router import api_router
from app.utils.logger import logger
from app.utils.sample_seeder import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    logger.info("Initializing VOCX AI Database Schema...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial admin and regional data
    try:
        db = SessionLocal()
        seed_database(db)
        db.close()
        logger.info("Database schema and initial seed ready.")
    except Exception as e:
        logger.warning(f"Database auto-seed warning: {e}")

    yield
    logger.info("Shutting down VOCX AI backend service.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Versioned API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health Check"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint evaluating service status and database connectivity."""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "api_v1_prefix": settings.API_V1_STR
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
