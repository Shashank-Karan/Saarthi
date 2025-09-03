from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List

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
    is_admin: bool
    is_active: bool
    last_login: Optional[datetime] = None
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

# Admin-specific schemas
class UserUpdate(BaseModel):
    name: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None

class AdminUserResponse(UserResponse):
    posts_count: Optional[int] = None
    comments_count: Optional[int] = None
    chat_messages_count: Optional[int] = None
    journal_entries_count: Optional[int] = None

class ContentModerationAction(BaseModel):
    action: str  # "delete", "hide", "approve", "flag"
    reason: Optional[str] = None

class AdminStats(BaseModel):
    total_users: int
    active_users: int
    admin_users: int
    total_posts: int
    total_comments: int
    total_chat_messages: int
    total_journal_entries: int
    posts_this_week: int
    comments_this_week: int
    new_users_this_week: int

# Krishna Path schemas
class EmotionBase(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    color: str
    is_active: bool = True

class EmotionCreate(EmotionBase):
    pass

class EmotionUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None

class EmotionResponse(EmotionBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class VerseBase(BaseModel):
    sanskrit: str
    hindi: str
    english: str
    explanation: str
    chapter: Optional[str] = None
    verse_number: Optional[str] = None
    is_active: bool = True

class VerseCreate(VerseBase):
    emotion_id: str

class VerseUpdate(BaseModel):
    sanskrit: Optional[str] = None
    hindi: Optional[str] = None
    english: Optional[str] = None
    explanation: Optional[str] = None
    chapter: Optional[str] = None
    verse_number: Optional[str] = None
    is_active: Optional[bool] = None
    emotion_id: Optional[str] = None

class VerseResponse(VerseBase):
    id: str
    emotion_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class VerseWithEmotion(VerseResponse):
    emotion: EmotionResponse

class AdminBase(BaseModel):
    username: str

class AdminCreate(AdminBase):
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(AdminBase):
    id: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class InteractionCreate(BaseModel):
    emotion_id: str
    verse_id: str
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class InteractionResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    emotion_id: str
    verse_id: str
    session_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InteractionWithDetails(InteractionResponse):
    emotion: EmotionResponse
    verse: VerseResponse
    user: Optional[UserResponse] = None

# Analytics schemas
class DashboardStats(BaseModel):
    total_interactions: int
    unique_users: int
    popular_emotions: List[tuple]  # [(emotion_name, count), ...]
    recent_interactions: List[InteractionWithDetails]
    emotions_count: int
    verses_count: int

class AdminDashboardStats(BaseModel):
    user_stats: AdminStats
    krishna_path_stats: DashboardStats
    recent_posts: List[PostWithAuthor]
    recent_users: List[AdminUserResponse]

# Thought of the Day schemas
class ThoughtOfTheDayBase(BaseModel):
    content: str
    author: Optional[str] = None
    language: str = "english"
    category: Optional[str] = None
    target_date: Optional[date] = None
    is_active: bool = True
    is_featured: bool = False

class ThoughtOfTheDayCreate(ThoughtOfTheDayBase):
    pass

class ThoughtOfTheDayUpdate(BaseModel):
    content: Optional[str] = None
    author: Optional[str] = None
    language: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[date] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class ThoughtOfTheDayResponse(ThoughtOfTheDayBase):
    id: str
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ThoughtOfTheDayWithCreator(ThoughtOfTheDayResponse):
    creator: Optional[UserResponse] = None

# Scripture schemas
class ScriptureBase(BaseModel):
    title: str
    description: str
    slug: str
    icon: str
    color: str
    introduction: str
    key_teachings: str  # JSON string
    famous_verses: str  # JSON string
    is_active: bool = True
    order_index: int = 0

class ScriptureCreate(ScriptureBase):
    pass

class ScriptureUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    introduction: Optional[str] = None
    key_teachings: Optional[str] = None
    famous_verses: Optional[str] = None
    is_active: Optional[bool] = None
    order_index: Optional[int] = None

class ScriptureResponse(ScriptureBase):
    id: str
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ScriptureWithCreator(ScriptureResponse):
    creator: Optional[UserResponse] = None