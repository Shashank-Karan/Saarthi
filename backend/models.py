from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Date, func
from sqlalchemy.orm import relationship
from .database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    chat_messages = relationship("ChatMessage", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    image_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    likes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, default=generate_uuid)
    content = Column(Text, nullable=False)
    post_id = Column(String, ForeignKey("posts.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    content = Column(Text, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_ai_response = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="chat_messages")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    mood = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    author = relationship("User", back_populates="journal_entries")

# Krishna Path Models
class Emotion(Base):
    __tablename__ = "emotions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)  # Internal name
    display_name = Column(String, nullable=False)  # Display name
    description = Column(String, nullable=True)  # Descriptive text
    color = Column(String, nullable=False)  # Hex color code
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    verses = relationship("Verse", back_populates="emotion")

class Verse(Base):
    __tablename__ = "verses"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    emotion_id = Column(String, ForeignKey("emotions.id"), nullable=False)
    sanskrit = Column(Text, nullable=False)
    hindi = Column(Text, nullable=False)
    english = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    chapter = Column(String, nullable=True)  # Bhagavad Gita chapter
    verse_number = Column(String, nullable=True)  # Verse number
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    emotion = relationship("Emotion", back_populates="verses")

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    last_login = Column(DateTime, nullable=True)

class Interaction(Base):
    __tablename__ = "interactions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # Can be anonymous
    emotion_id = Column(String, ForeignKey("emotions.id"), nullable=False)
    verse_id = Column(String, ForeignKey("verses.id"), nullable=False)
    session_id = Column(String, nullable=True)  # For anonymous tracking
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    user = relationship("User")
    emotion = relationship("Emotion")
    verse = relationship("Verse")

class ThoughtOfTheDay(Base):
    __tablename__ = "thoughts_of_the_day"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    content = Column(Text, nullable=False)
    author = Column(String, nullable=True)  # Author/Source of the thought
    language = Column(String, default="english", nullable=False)  # Language of the thought
    category = Column(String, nullable=True)  # Category like "wisdom", "meditation", etc.
    target_date = Column(Date, nullable=True)  # Specific date for the thought
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)  # To mark as today's thought
    created_by = Column(String, ForeignKey("users.id"), nullable=True)  # Admin who created it
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    creator = relationship("User")

class Scripture(Base):
    __tablename__ = "scriptures"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    slug = Column(String, unique=True, nullable=False)  # URL-friendly identifier
    icon = Column(String, nullable=False)  # Icon name or class
    color = Column(String, nullable=False)  # Color class for UI
    introduction = Column(Text, nullable=False)
    key_teachings = Column(Text, nullable=False)  # JSON string of teachings array
    famous_verses = Column(Text, nullable=False)  # JSON string of verses array
    is_active = Column(Boolean, default=True, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)  # For ordering display
    created_by = Column(String, ForeignKey("users.id"), nullable=True)  # Admin who created it
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    creator = relationship("User")