#!/usr/bin/env python3
"""
Main FastAPI application for Saarthi
"""
# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uvicorn

# Import our modules
from .database import get_db, engine
from .models import Base, User, Post, Comment, ChatMessage, JournalEntry
from .schemas import (
    UserCreate, UserLogin, UserResponse, 
    PostCreate, PostResponse, PostWithAuthor,
    CommentCreate, CommentResponse, CommentWithAuthor,
    ChatMessageCreate, ChatMessageResponse, ChatMessageWithUser,
    JournalEntryCreate, JournalEntryResponse,
    Token
)
from .gemini_service import get_scripture_response
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import desc, func

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Saarthi API", description="Hindu Scripture Companion API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub", "")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Auth routes
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        name=user.name,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_credentials.username).first()
    if not user or not verify_password(user_credentials.password, str(user.password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Posts routes
@app.get("/api/posts", response_model=List[PostWithAuthor])
async def get_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).options(selectinload(Post.author)).order_by(desc(Post.created_at)).all()
    
    result = []
    for post in posts:
        comment_count = db.query(func.count(Comment.id)).filter(Comment.post_id == post.id).scalar()
        post_dict = {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "author_id": post.author_id,
            "image_url": post.image_url,
            "video_url": post.video_url,
            "likes": post.likes,
            "created_at": post.created_at,
            "author": post.author,
            "comments": comment_count
        }
        result.append(post_dict)
    
    return result

@app.post("/api/posts", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_post = Post(
        title=post.title,
        content=post.content,
        author_id=current_user.id,
        image_url=post.image_url,
        video_url=post.video_url
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.post("/api/posts/{post_id}/like")
async def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    current_likes = post.likes or 0
    post.likes = current_likes + 1
    db.commit()
    return {"message": "Post liked successfully"}

# Comments routes
@app.get("/api/posts/{post_id}/comments", response_model=List[CommentWithAuthor])
async def get_comments(post_id: str, db: Session = Depends(get_db)):
    comments = db.query(Comment).options(selectinload(Comment.author)).filter(
        Comment.post_id == post_id
    ).order_by(Comment.created_at).all()
    return comments

@app.post("/api/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: str,
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_comment = Comment(
        content=comment.content,
        post_id=post_id,
        author_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

# Chat routes
@app.get("/api/chat/messages", response_model=List[ChatMessageWithUser])
async def get_chat_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(ChatMessage).options(selectinload(ChatMessage.user)).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at).all()
    return messages

class ChatResponse(BaseModel):
    user_message: ChatMessageResponse
    ai_message: ChatMessageResponse

@app.post("/api/chat/messages", response_model=ChatResponse)
async def create_chat_message(
    message: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save user message
    user_message = ChatMessage(
        content=message.content,
        user_id=current_user.id,
        is_ai_response=False
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Get AI response
    ai_response_content = await get_scripture_response(message.content)
    ai_message = ChatMessage(
        content=ai_response_content,
        user_id=current_user.id,
        is_ai_response=True
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    
    return ChatResponse(
        user_message=user_message,
        ai_message=ai_message
    )

# Journal endpoints
@app.get("/api/journal", response_model=List[JournalEntryResponse])
async def get_journal_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entries = db.query(JournalEntry).filter(
        JournalEntry.author_id == current_user.id
    ).order_by(desc(JournalEntry.created_at)).all()
    return entries

@app.post("/api/journal", response_model=JournalEntryResponse)
async def create_journal_entry(
    entry: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_entry = JournalEntry(
        title=entry.title,
        content=entry.content,
        mood=entry.mood,
        author_id=current_user.id
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Saarthi API"}

# Serve static files and frontend
@app.get("/assets/{file_path:path}")
async def serve_assets(file_path: str):
    return FileResponse(f"dist/public/assets/{file_path}")

# Catch-all route for React SPA - this must be last
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    # For non-API routes, serve the React app
    if not full_path.startswith("api/"):
        return FileResponse("dist/public/index.html")
    # If it's an API route that doesn't exist, return 404
    raise HTTPException(status_code=404, detail="API endpoint not found")

# Entry point is handled by root main.py