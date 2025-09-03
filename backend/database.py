from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Try alternative environment variable names that might be used by Replit
    DATABASE_URL = os.getenv("DB_URL") or os.getenv("POSTGRES_URL") or os.getenv("NEON_DATABASE_URL")
    
if not DATABASE_URL or "neon.tech" in DATABASE_URL:
    # Use SQLite as fallback for development
    print("Using SQLite database for development...")
    DATABASE_URL = "sqlite:///./saarthi.db"

print(f"Database URL: {DATABASE_URL[:50]}...")

# Configure engine with appropriate settings for SQLite or PostgreSQL
if DATABASE_URL.startswith('sqlite'):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # For SQLite
        echo=False
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        pool_recycle=300,
        pool_pre_ping=True,
        echo=False
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()