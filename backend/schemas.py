from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# User schemas
class UserBase(BaseModel):
    username: str
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Post schemas
class PostBase(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: str
    author_id: str
    likes: int
    created_at: datetime

    class Config:
        from_attributes = True

class PostWithAuthor(PostResponse):
    author: UserResponse
    comments: int

# Comment schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: str
    post_id: str
    author_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class CommentWithAuthor(CommentResponse):
    author: UserResponse

# Chat message schemas
class ChatMessageBase(BaseModel):
    content: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: str
    user_id: str
    is_ai_response: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ChatMessageWithUser(ChatMessageResponse):
    user: UserResponse

# Journal entry schemas
class JournalEntryBase(BaseModel):
    title: str
    content: str
    mood: Optional[str] = None

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryResponse(JournalEntryBase):
    id: str
    author_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None