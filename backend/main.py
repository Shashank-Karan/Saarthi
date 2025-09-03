#!/usr/bin/env python3
"""
Main FastAPI application for Saarthi
"""
# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, status, Request
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
from .database import get_db, engine, SessionLocal
from .models import Base, User, Post, Comment, ChatMessage, JournalEntry, Emotion, Verse, Admin, Interaction, ThoughtOfTheDay, Scripture
from .schemas import (
    UserCreate, UserLogin, UserResponse, UserUpdate, AdminUserResponse,
    PostCreate, PostResponse, PostWithAuthor,
    CommentCreate, CommentResponse, CommentWithAuthor,
    ChatMessageCreate, ChatMessageResponse, ChatMessageWithUser,
    JournalEntryCreate, JournalEntryResponse,
    EmotionCreate, EmotionResponse, EmotionUpdate,
    VerseCreate, VerseResponse, VerseUpdate, VerseWithEmotion,
    AdminCreate, AdminLogin, AdminResponse,
    InteractionCreate, InteractionResponse, InteractionWithDetails,
    ThoughtOfTheDayCreate, ThoughtOfTheDayResponse, ThoughtOfTheDayUpdate, ThoughtOfTheDayWithCreator,
    ScriptureCreate, ScriptureResponse, ScriptureUpdate, ScriptureWithCreator,
    DashboardStats, AdminDashboardStats, AdminStats, ContentModerationAction,
    Token
)
from .gemini_service import get_scripture_response
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import desc, func, and_
import random
import uuid

# Create tables
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Saarthi API", description="Hindu Scripture Companion API")
# Serve static files from the frontend build output at /static
import pathlib
frontend_dist = pathlib.Path(__file__).parent.parent / "dist" / "public"
app.mount("/static", StaticFiles(directory=frontend_dist, html=True), name="static")

# Serve ads.txt at the root for AdSense
from fastapi.responses import FileResponse
@app.get("/ads.txt")
async def ads_txt():
    ads_path = frontend_dist / "ads.txt"
    if ads_path.exists():
        return FileResponse(str(ads_path), media_type="text/plain")
    else:
        return FileResponse("", media_type="text/plain", status_code=404)

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

async def get_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

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
    
    # Update likes using proper SQLAlchemy approach
    current_likes = getattr(post, 'likes', 0) or 0
    setattr(post, 'likes', current_likes + 1)
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

# Krishna Path API Endpoints

# Admin authentication for Krishna Path
admin_security = HTTPBearer()

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(admin_security),
    db: Session = Depends(get_db)
) -> Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub", "")
        user_type: str = payload.get("type", "")
        if username is None or user_type != "admin":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    admin = db.query(Admin).filter(and_(Admin.username == username, Admin.is_active == True)).first()
    if admin is None:
        raise credentials_exception
    return admin

# Emotions
@app.get("/api/krishna-path/emotions", response_model=List[EmotionResponse])
async def get_emotions(db: Session = Depends(get_db)):
    """Get all active emotions"""
    emotions = db.query(Emotion).filter(Emotion.is_active == True).all()
    return emotions

@app.post("/api/krishna-path/emotions", response_model=EmotionResponse)
async def create_emotion(
    emotion: EmotionCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new emotion (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_emotion = Emotion(**emotion.dict())
    db.add(db_emotion)
    db.commit()
    db.refresh(db_emotion)
    return db_emotion

@app.get("/api/krishna-path/admin/emotions", response_model=List[EmotionResponse])
async def get_all_emotions_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all emotions including inactive ones (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    emotions = db.query(Emotion).all()
    return emotions

@app.put("/api/krishna-path/emotions/{emotion_id}", response_model=EmotionResponse)
async def update_emotion(
    emotion_id: str,
    emotion_update: EmotionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an emotion (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_emotion = db.query(Emotion).filter(Emotion.id == emotion_id).first()
    if not db_emotion:
        raise HTTPException(status_code=404, detail="Emotion not found")
    
    update_data = emotion_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_emotion, field, value)
    
    db.commit()
    db.refresh(db_emotion)
    return db_emotion

@app.delete("/api/krishna-path/emotions/{emotion_id}")
async def delete_emotion(
    emotion_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    force: bool = False
):
    """Delete an emotion (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_emotion = db.query(Emotion).filter(Emotion.id == emotion_id).first()
    if not db_emotion:
        raise HTTPException(status_code=404, detail="Emotion not found")
    
    # Check if emotion has verses
    verse_count = db.query(Verse).filter(Verse.emotion_id == emotion_id).count()
    if verse_count > 0:
        if not force:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot delete emotion with {verse_count} verses. Use force=true to delete emotion and all associated verses."
            )
        else:
            # Delete all verses associated with this emotion first
            db.query(Verse).filter(Verse.emotion_id == emotion_id).delete()
    
    db.delete(db_emotion)
    db.commit()
    return {"message": f"Emotion deleted successfully{' along with ' + str(verse_count) + ' verses' if verse_count > 0 and force else ''}"}

# Verses
@app.get("/api/krishna-path/verses/{emotion_id}", response_model=List[VerseWithEmotion])
async def get_verses_by_emotion(emotion_id: str, db: Session = Depends(get_db)):
    """Get all verses for a specific emotion"""
    verses = db.query(Verse).options(selectinload(Verse.emotion)).filter(
        and_(Verse.emotion_id == emotion_id, Verse.is_active == True)
    ).all()
    return verses

@app.get("/api/krishna-path/verses/{emotion_id}/random", response_model=VerseWithEmotion)
async def get_random_verse(emotion_id: str, db: Session = Depends(get_db)):
    """Get a random verse for a specific emotion"""
    verses = db.query(Verse).options(selectinload(Verse.emotion)).filter(
        and_(Verse.emotion_id == emotion_id, Verse.is_active == True)
    ).all()
    
    if not verses:
        raise HTTPException(status_code=404, detail="No verses found for this emotion")
    
    selected_verse = random.choice(verses)
    return selected_verse

@app.get("/api/krishna-path/verses/count/{emotion_id}")
async def get_verse_count_for_emotion(emotion_id: str, db: Session = Depends(get_db)):
    """Get count of active verses for a specific emotion"""
    count = db.query(Verse).filter(
        and_(Verse.emotion_id == emotion_id, Verse.is_active == True)
    ).count()
    
    return {"count": count}

@app.post("/api/krishna-path/verses", response_model=VerseResponse)
async def create_verse(
    verse: VerseCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new verse (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    # Verify emotion exists
    emotion = db.query(Emotion).filter(Emotion.id == verse.emotion_id).first()
    if not emotion:
        raise HTTPException(status_code=404, detail="Emotion not found")
    
    db_verse = Verse(**verse.dict())
    db.add(db_verse)
    db.commit()
    db.refresh(db_verse)
    return db_verse

@app.get("/api/krishna-path/admin/verses", response_model=List[VerseWithEmotion])
async def get_all_verses_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all verses including inactive ones (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    verses = db.query(Verse).options(selectinload(Verse.emotion)).all()
    return verses

@app.put("/api/krishna-path/verses/{verse_id}", response_model=VerseResponse)
async def update_verse(
    verse_id: str,
    verse_update: VerseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a verse (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_verse = db.query(Verse).filter(Verse.id == verse_id).first()
    if not db_verse:
        raise HTTPException(status_code=404, detail="Verse not found")
    
    update_data = verse_update.dict(exclude_unset=True)
    
    # If emotion_id is being updated, verify the new emotion exists
    if "emotion_id" in update_data:
        emotion = db.query(Emotion).filter(Emotion.id == update_data["emotion_id"]).first()
        if not emotion:
            raise HTTPException(status_code=404, detail="Emotion not found")
    
    for field, value in update_data.items():
        setattr(db_verse, field, value)
    
    db.commit()
    db.refresh(db_verse)
    return db_verse

@app.delete("/api/krishna-path/verses/{verse_id}")
async def delete_verse(
    verse_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a verse (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_verse = db.query(Verse).filter(Verse.id == verse_id).first()
    if not db_verse:
        raise HTTPException(status_code=404, detail="Verse not found")
    
    db.delete(db_verse)
    db.commit()
    return {"message": "Verse deleted successfully"}

# Interactions (for analytics)
@app.post("/api/krishna-path/interactions", response_model=InteractionResponse)
async def create_interaction(
    interaction: InteractionCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track user interaction with verses"""
    db_interaction = Interaction(
        user_id=current_user.id,
        emotion_id=interaction.emotion_id,
        verse_id=interaction.verse_id,
        session_id=interaction.session_id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@app.post("/api/krishna-path/admin/login", response_model=Token)
async def admin_login(admin_credentials: AdminLogin, db: Session = Depends(get_db)):
    """Admin login for Krishna Path dashboard"""
    admin = db.query(Admin).filter(Admin.username == admin_credentials.username).first()
    if not admin or not verify_password(admin_credentials.password, str(admin.password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.username, "type": "admin"}, expires_delta=access_token_expires
    )
    
    # Update last login
    from sqlalchemy import update
    db.execute(update(Admin).where(Admin.id == admin.id).values(last_login=datetime.utcnow()))
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/krishna-path/admin/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for admin"""
    total_interactions = db.query(func.count(Interaction.id)).scalar()
    unique_users = db.query(func.count(func.distinct(Interaction.user_id))).scalar()
    emotions_count = db.query(func.count(Emotion.id)).filter(Emotion.is_active == True).scalar()
    verses_count = db.query(func.count(Verse.id)).filter(Verse.is_active == True).scalar()
    
    # Popular emotions
    popular_emotions = db.query(
        Emotion.display_name, func.count(Interaction.id).label('count')
    ).join(Interaction).group_by(Emotion.id, Emotion.display_name).order_by(desc('count')).limit(5).all()
    
    # Recent interactions
    recent_interactions = db.query(Interaction).options(
        selectinload(Interaction.emotion),
        selectinload(Interaction.verse),
        selectinload(Interaction.user)
    ).order_by(desc(Interaction.created_at)).limit(10).all()
    
    return DashboardStats(
        total_interactions=total_interactions or 0,
        unique_users=unique_users or 0,
        popular_emotions=[(row[0], row[1]) for row in popular_emotions],
        recent_interactions=[InteractionWithDetails.from_orm(interaction) for interaction in recent_interactions],
        emotions_count=emotions_count or 0,
        verses_count=verses_count or 0
    )

async def seed_initial_data():
    """Seed initial data for Krishna Path"""
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(Emotion).first():
            return
        
        # Create emotions
        emotions_data = [
            {"name": "happy", "display_name": "Happy", "color": "#FFD700"},
            {"name": "peace", "display_name": "Peace", "color": "#87CEEB"},
            {"name": "anxious", "display_name": "Anxious", "color": "#FFA500"},
            {"name": "angry", "display_name": "Angry", "color": "#FF4444"},
            {"name": "sad", "display_name": "Sad", "color": "#6495ED"},
            {"name": "protection", "display_name": "Protection", "color": "#32CD32"},
            {"name": "lazy", "display_name": "Lazy", "color": "#A9A9A9"},
            {"name": "lonely", "display_name": "Lonely", "color": "#9370DB"}
        ]
        
        emotions = []
        for emotion_data in emotions_data:
            emotion = Emotion(
                id=str(uuid.uuid4()),
                **emotion_data
            )
            db.add(emotion)
            emotions.append(emotion)
        
        db.commit()
        
        # Import comprehensive verses data
        from comprehensive_verses import COMPREHENSIVE_VERSES_DATA
        verses_data = COMPREHENSIVE_VERSES_DATA
        
        # Create emotion lookup
        emotion_lookup = {emotion.name: emotion for emotion in emotions}
        
        for verse_data in verses_data:
            emotion = emotion_lookup[verse_data["emotion_name"]]
            verse = Verse(
                id=str(uuid.uuid4()),
                emotion_id=emotion.id,
                sanskrit=verse_data["sanskrit"],
                hindi=verse_data["hindi"],
                english=verse_data["english"],
                explanation=verse_data["explanation"],
                chapter=verse_data["chapter"],
                verse_number=verse_data["verse_number"]
            )
            db.add(verse)
        
        # Create default admin user (in User table, not Admin table)
        admin_user = User(
            id=str(uuid.uuid4()),
            username="admin",
            name="Administrator", 
            password=get_password_hash("krishna123"),
            is_admin=True,
            is_active=True
        )
        db.add(admin_user)
        
        db.commit()
        print("Krishna Path data seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    await seed_initial_data()

# ==================== ADMIN API ENDPOINTS ====================

# Admin Dashboard
@app.get("/api/admin/dashboard", response_model=AdminDashboardStats)
async def get_admin_dashboard(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive admin dashboard statistics"""
    # User statistics
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    admin_users = db.query(func.count(User.id)).filter(User.is_admin == True).scalar()
    
    # Content statistics
    total_posts = db.query(func.count(Post.id)).scalar()
    total_comments = db.query(func.count(Comment.id)).scalar()
    total_chat_messages = db.query(func.count(ChatMessage.id)).scalar()
    total_journal_entries = db.query(func.count(JournalEntry.id)).scalar()
    
    # Weekly statistics (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    posts_this_week = db.query(func.count(Post.id)).filter(Post.created_at >= week_ago).scalar()
    comments_this_week = db.query(func.count(Comment.id)).filter(Comment.created_at >= week_ago).scalar()
    new_users_this_week = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar()
    
    user_stats = AdminStats(
        total_users=total_users or 0,
        active_users=active_users or 0,
        admin_users=admin_users or 0,
        total_posts=total_posts or 0,
        total_comments=total_comments or 0,
        total_chat_messages=total_chat_messages or 0,
        total_journal_entries=total_journal_entries or 0,
        posts_this_week=posts_this_week or 0,
        comments_this_week=comments_this_week or 0,
        new_users_this_week=new_users_this_week or 0
    )
    
    # Krishna Path statistics (reuse existing endpoint logic)
    total_interactions = db.query(func.count(Interaction.id)).scalar()
    unique_users_interactions = db.query(func.count(func.distinct(Interaction.user_id))).scalar()
    emotions_count = db.query(func.count(Emotion.id)).filter(Emotion.is_active == True).scalar()
    verses_count = db.query(func.count(Verse.id)).filter(Verse.is_active == True).scalar()
    
    # Popular emotions
    popular_emotions = db.query(
        Emotion.display_name, func.count(Interaction.id).label('count')
    ).join(Interaction).group_by(Emotion.id, Emotion.display_name).order_by(desc('count')).limit(5).all()
    
    # Recent interactions - filter out interactions with null emotion or verse
    recent_interactions = db.query(Interaction).options(
        selectinload(Interaction.emotion),
        selectinload(Interaction.verse),
        selectinload(Interaction.user)
    ).filter(
        Interaction.emotion_id.isnot(None),
        Interaction.verse_id.isnot(None)
    ).order_by(desc(Interaction.created_at)).limit(10).all()
    
    # Additional safety check - only include interactions with valid emotion and verse
    valid_interactions = [
        interaction for interaction in recent_interactions 
        if interaction.emotion is not None and interaction.verse is not None
    ]
    
    krishna_path_stats = DashboardStats(
        total_interactions=total_interactions or 0,
        unique_users=unique_users_interactions or 0,
        popular_emotions=[(row[0], row[1]) for row in popular_emotions],
        recent_interactions=[InteractionWithDetails.from_orm(interaction) for interaction in valid_interactions],
        emotions_count=emotions_count or 0,
        verses_count=verses_count or 0
    )
    
    # Recent posts with authors
    recent_posts = db.query(Post).options(selectinload(Post.author)).order_by(desc(Post.created_at)).limit(5).all()
    recent_posts_with_comments = []
    for post in recent_posts:
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
            "comments": comment_count or 0
        }
        recent_posts_with_comments.append(post_dict)
    
    # Recent users with statistics
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(5).all()
    recent_users_with_stats = []
    for user in recent_users:
        posts_count = db.query(func.count(Post.id)).filter(Post.author_id == user.id).scalar()
        comments_count = db.query(func.count(Comment.id)).filter(Comment.author_id == user.id).scalar()
        chat_messages_count = db.query(func.count(ChatMessage.id)).filter(ChatMessage.user_id == user.id).scalar()
        journal_entries_count = db.query(func.count(JournalEntry.id)).filter(JournalEntry.author_id == user.id).scalar()
        
        user_dict = {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "is_admin": user.is_admin,
            "is_active": user.is_active,
            "last_login": user.last_login,
            "created_at": user.created_at,
            "posts_count": posts_count or 0,
            "comments_count": comments_count or 0,
            "chat_messages_count": chat_messages_count or 0,
            "journal_entries_count": journal_entries_count or 0
        }
        recent_users_with_stats.append(user_dict)
    
    return AdminDashboardStats(
        user_stats=user_stats,
        krishna_path_stats=krishna_path_stats,
        recent_posts=recent_posts_with_comments,
        recent_users=recent_users_with_stats
    )

# User Management Endpoints
@app.get("/api/admin/users", response_model=List[AdminUserResponse])
async def get_all_users(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    is_admin: Optional[bool] = None,
    is_active: Optional[bool] = None
):
    """Get all users with filtering and pagination"""
    query = db.query(User)
    
    if search:
        query = query.filter(
            (User.username.contains(search)) | 
            (User.name.contains(search))
        )
    
    if is_admin is not None:
        query = query.filter(User.is_admin == is_admin)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    
    # Add statistics for each user
    users_with_stats = []
    for user in users:
        posts_count = db.query(func.count(Post.id)).filter(Post.author_id == user.id).scalar()
        comments_count = db.query(func.count(Comment.id)).filter(Comment.author_id == user.id).scalar()
        chat_messages_count = db.query(func.count(ChatMessage.id)).filter(ChatMessage.user_id == user.id).scalar()
        journal_entries_count = db.query(func.count(JournalEntry.id)).filter(JournalEntry.author_id == user.id).scalar()
        
        user_dict = {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "is_admin": user.is_admin,
            "is_active": user.is_active,
            "last_login": user.last_login,
            "created_at": user.created_at,
            "posts_count": posts_count or 0,
            "comments_count": comments_count or 0,
            "chat_messages_count": chat_messages_count or 0,
            "journal_entries_count": journal_entries_count or 0
        }
        users_with_stats.append(user_dict)
    
    return users_with_stats

@app.patch("/api/admin/users/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update user information and permissions"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields if provided
    if user_update.name is not None:
        setattr(user, 'name', user_update.name)
    if user_update.is_admin is not None:
        setattr(user, 'is_admin', user_update.is_admin)
    if user_update.is_active is not None:
        setattr(user, 'is_active', user_update.is_active)
    
    db.commit()
    db.refresh(user)
    
    # Get user statistics
    posts_count = db.query(func.count(Post.id)).filter(Post.author_id == user.id).scalar()
    comments_count = db.query(func.count(Comment.id)).filter(Comment.author_id == user.id).scalar()
    chat_messages_count = db.query(func.count(ChatMessage.id)).filter(ChatMessage.user_id == user.id).scalar()
    journal_entries_count = db.query(func.count(JournalEntry.id)).filter(JournalEntry.author_id == user.id).scalar()
    
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "is_admin": user.is_admin,
        "is_active": user.is_active,
        "last_login": user.last_login,
        "created_at": user.created_at,
        "posts_count": posts_count or 0,
        "comments_count": comments_count or 0,
        "chat_messages_count": chat_messages_count or 0,
        "journal_entries_count": journal_entries_count or 0
    }

# Content Moderation Endpoints
@app.get("/api/admin/posts", response_model=List[PostWithAuthor])
async def get_all_posts_admin(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None
):
    """Get all posts for moderation"""
    query = db.query(Post).options(selectinload(Post.author))
    
    if search:
        query = query.filter(
            (Post.title.contains(search)) | 
            (Post.content.contains(search))
        )
    
    posts = query.order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    
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
            "comments": comment_count or 0
        }
        result.append(post_dict)
    
    return result

@app.delete("/api/admin/posts/{post_id}")
async def delete_post_admin(
    post_id: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a post and all its comments"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Delete all comments first
    db.query(Comment).filter(Comment.post_id == post_id).delete()
    # Delete the post
    db.delete(post)
    db.commit()
    
    return {"message": "Post deleted successfully"}

@app.get("/api/admin/comments", response_model=List[CommentWithAuthor])
async def get_all_comments_admin(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None
):
    """Get all comments for moderation"""
    query = db.query(Comment).options(selectinload(Comment.author))
    
    if search:
        query = query.filter(Comment.content.contains(search))
    
    comments = query.order_by(desc(Comment.created_at)).offset(skip).limit(limit).all()
    return comments

@app.delete("/api/admin/comments/{comment_id}")
async def delete_comment_admin(
    comment_id: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}

# Chat Messages Management
@app.get("/api/admin/chat-messages", response_model=List[ChatMessageWithUser])
async def get_all_chat_messages_admin(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    user_id: Optional[str] = None
):
    """Get all chat messages for monitoring"""
    query = db.query(ChatMessage).options(selectinload(ChatMessage.user))
    
    if user_id:
        query = query.filter(ChatMessage.user_id == user_id)
    
    messages = query.order_by(desc(ChatMessage.created_at)).offset(skip).limit(limit).all()
    return messages

# Journal Entries Management  
@app.get("/api/admin/journal-entries", response_model=List[JournalEntryResponse])
async def get_all_journal_entries_admin(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    user_id: Optional[str] = None
):
    """Get all journal entries for monitoring"""
    query = db.query(JournalEntry)
    
    if user_id:
        query = query.filter(JournalEntry.author_id == user_id)
    
    entries = query.order_by(desc(JournalEntry.created_at)).offset(skip).limit(limit).all()
    return entries

@app.delete("/api/admin/journal-entries/{entry_id}")
async def delete_journal_entry_admin(
    entry_id: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a journal entry"""
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    db.delete(entry)
    db.commit()
    
    return {"message": "Journal entry deleted successfully"}

# Thought of the Day routes
@app.get("/api/thought-of-the-day/current", response_model=ThoughtOfTheDayResponse)
async def get_current_thought(db: Session = Depends(get_db)):
    """Get the current featured thought of the day with automatic rotation"""
    from datetime import datetime, date, timedelta
    
    # Check if there's a featured thought for today
    today = date.today()
    featured_thought = db.query(ThoughtOfTheDay).filter(
        and_(
            ThoughtOfTheDay.is_featured == True, 
            ThoughtOfTheDay.is_active == True
        )
    ).first()
    
    # If featured thought exists, check if it's been featured for more than 24 hours
    if featured_thought:
        last_update = featured_thought.updated_at.date() if featured_thought.updated_at else featured_thought.created_at.date()
        if today > last_update:
            # More than 24 hours, rotate to a new thought
            db.query(ThoughtOfTheDay).filter(ThoughtOfTheDay.id == featured_thought.id).update(
                {"is_featured": False}
            )
            
            # Get next available active thought
            next_thoughts = db.query(ThoughtOfTheDay).filter(
                and_(
                    ThoughtOfTheDay.is_active == True,
                    ThoughtOfTheDay.id != featured_thought.id
                )
            ).all()
            
            if next_thoughts:
                new_featured = random.choice(next_thoughts)
                db.query(ThoughtOfTheDay).filter(ThoughtOfTheDay.id == new_featured.id).update(
                    {"is_featured": True}
                )
                db.commit()
                featured_thought = new_featured
    
    # If no featured thought, get a random active thought and feature it
    if not featured_thought:
        thoughts = db.query(ThoughtOfTheDay).filter(ThoughtOfTheDay.is_active == True).all()
        if thoughts:
            featured_thought = random.choice(thoughts)
            db.query(ThoughtOfTheDay).filter(ThoughtOfTheDay.id == featured_thought.id).update(
                {"is_featured": True}
            )
            db.commit()
    
    if not featured_thought:
        raise HTTPException(status_code=404, detail="No thoughts available")
    
    return featured_thought

@app.get("/api/thought-of-the-day", response_model=List[ThoughtOfTheDayResponse])
async def get_all_thoughts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    active_only: bool = True
):
    """Get all thoughts of the day"""
    query = db.query(ThoughtOfTheDay)
    
    if active_only:
        query = query.filter(ThoughtOfTheDay.is_active == True)
    
    thoughts = query.order_by(desc(ThoughtOfTheDay.created_at)).offset(skip).limit(limit).all()
    return thoughts

# Admin routes for managing thoughts
@app.post("/api/admin/thought-of-the-day", response_model=ThoughtOfTheDayResponse)
async def create_thought(
    thought: ThoughtOfTheDayCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new thought of the day (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # If this thought is marked as featured, unfeatured all other thoughts
    if thought.is_featured:
        db.query(ThoughtOfTheDay).filter(ThoughtOfTheDay.is_featured == True).update(
            {"is_featured": False}
        )
    
    db_thought = ThoughtOfTheDay(
        **thought.dict(),
        created_by=current_user.id
    )
    db.add(db_thought)
    db.commit()
    db.refresh(db_thought)
    return db_thought

@app.get("/api/admin/thought-of-the-day", response_model=List[ThoughtOfTheDayWithCreator])
async def get_all_thoughts_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get all thoughts for admin management"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    thoughts = db.query(ThoughtOfTheDay).options(
        selectinload(ThoughtOfTheDay.creator)
    ).order_by(desc(ThoughtOfTheDay.created_at)).offset(skip).limit(limit).all()
    return thoughts

@app.put("/api/admin/thought-of-the-day/{thought_id}", response_model=ThoughtOfTheDayResponse)
async def update_thought(
    thought_id: str,
    thought_update: ThoughtOfTheDayUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a thought of the day (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    thought = db.query(ThoughtOfTheDay).filter(ThoughtOfTheDay.id == thought_id).first()
    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")
    
    # If updating to featured, unfeatured all other thoughts
    if thought_update.is_featured and thought_update.is_featured != thought.is_featured:
        db.query(ThoughtOfTheDay).filter(
            and_(ThoughtOfTheDay.is_featured == True, ThoughtOfTheDay.id != thought_id)
        ).update({"is_featured": False})
    
    # Update thought with provided data
    update_data = thought_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(thought, field, value)
    
    db.commit()
    db.refresh(thought)
    return thought

@app.delete("/api/admin/thought-of-the-day/{thought_id}")
async def delete_thought(
    thought_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a thought of the day (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    thought = db.query(ThoughtOfTheDay).filter(ThoughtOfTheDay.id == thought_id).first()
    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")
    
    db.delete(thought)
    db.commit()
    return {"message": "Thought deleted successfully"}

@app.put("/api/admin/thought-of-the-day/{thought_id}/feature")
async def feature_thought(
    thought_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Feature a thought as today's thought (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    thought = db.query(ThoughtOfTheDay).filter(ThoughtOfTheDay.id == thought_id).first()
    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")
    
    # Unfeatured all other thoughts
    db.query(ThoughtOfTheDay).filter(ThoughtOfTheDay.is_featured == True).update(
        {"is_featured": False}
    )
    
    # Feature this thought
    db.query(ThoughtOfTheDay).filter(ThoughtOfTheDay.id == thought.id).update(
        {"is_featured": True}
    )
    db.commit()
    
    return {"message": "Thought featured successfully"}

# Scripture routes
@app.get("/api/scriptures", response_model=List[ScriptureResponse])
async def get_scriptures(
    db: Session = Depends(get_db),
    active_only: bool = True
):
    """Get all scriptures ordered by order_index"""
    query = db.query(Scripture)
    
    if active_only:
        query = query.filter(Scripture.is_active == True)
    
    scriptures = query.order_by(Scripture.order_index, Scripture.created_at).all()
    return scriptures

@app.get("/api/scriptures/{scripture_id}", response_model=ScriptureWithCreator)
async def get_scripture(scripture_id: str, db: Session = Depends(get_db)):
    """Get a specific scripture by ID"""
    scripture = db.query(Scripture).options(selectinload(Scripture.creator)).filter(Scripture.id == scripture_id).first()
    if not scripture:
        raise HTTPException(status_code=404, detail="Scripture not found")
    return scripture

@app.get("/api/scriptures/slug/{slug}", response_model=ScriptureWithCreator)
async def get_scripture_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get a specific scripture by slug"""
    scripture = db.query(Scripture).options(selectinload(Scripture.creator)).filter(
        and_(Scripture.slug == slug, Scripture.is_active == True)
    ).first()
    if not scripture:
        raise HTTPException(status_code=404, detail="Scripture not found")
    return scripture

# Admin routes for managing scriptures
@app.post("/api/admin/scriptures", response_model=ScriptureResponse)
async def create_scripture(
    scripture: ScriptureCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new scripture (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if slug already exists
    existing = db.query(Scripture).filter(Scripture.slug == scripture.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scripture with this slug already exists")
    
    db_scripture = Scripture(
        title=scripture.title,
        description=scripture.description,
        slug=scripture.slug,
        icon=scripture.icon,
        color=scripture.color,
        introduction=scripture.introduction,
        key_teachings=scripture.key_teachings,
        famous_verses=scripture.famous_verses,
        is_active=scripture.is_active,
        order_index=scripture.order_index,
        created_by=current_user.id
    )
    
    db.add(db_scripture)
    db.commit()
    db.refresh(db_scripture)
    
    return db_scripture

@app.get("/api/admin/scriptures", response_model=List[ScriptureWithCreator])
async def get_all_scriptures_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all scriptures for admin (including inactive)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    scriptures = db.query(Scripture).options(selectinload(Scripture.creator)).order_by(
        Scripture.order_index, Scripture.created_at
    ).offset(skip).limit(limit).all()
    
    return scriptures

@app.put("/api/admin/scriptures/{scripture_id}", response_model=ScriptureResponse)
async def update_scripture(
    scripture_id: str,
    scripture_update: ScriptureUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a scripture (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    scripture = db.query(Scripture).filter(Scripture.id == scripture_id).first()
    if not scripture:
        raise HTTPException(status_code=404, detail="Scripture not found")
    
    # Check if updating slug and if it conflicts
    if scripture_update.slug and scripture_update.slug != scripture.slug:
        existing = db.query(Scripture).filter(Scripture.slug == scripture_update.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Scripture with this slug already exists")
    
    # Update fields
    for field, value in scripture_update.dict(exclude_unset=True).items():
        setattr(scripture, field, value)
    
    scripture.updated_at = func.now()
    db.commit()
    db.refresh(scripture)
    
    return scripture

@app.delete("/api/admin/scriptures/{scripture_id}")
async def delete_scripture(
    scripture_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a scripture (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    scripture = db.query(Scripture).filter(Scripture.id == scripture_id).first()
    if not scripture:
        raise HTTPException(status_code=404, detail="Scripture not found")
    
    db.delete(scripture)
    db.commit()
    
    return {"message": "Scripture deleted successfully"}

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