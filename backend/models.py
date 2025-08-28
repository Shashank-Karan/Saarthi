from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, func
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