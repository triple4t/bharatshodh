
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ---------- Auth / User ----------

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    name: Optional[str] = None

class UserLogin(UserBase):
    password: str

class UserPublic(UserBase):
    id: str = Field(alias="_id")
    name: Optional[str] = None
    created_at: datetime
    status: str = "pending"  # pending, approved, rejected

    class Config:
        populate_by_name = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    status: str = "approved"  # Status of the account

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
class UserApprovalRequest(BaseModel):
    user_id: str
    action: str  # approved or rejected
    reason: Optional[str] = None

class ApprovalResponse(BaseModel):
    msg: str
    user_id: str
    status: str


# ---------- Admin / Management ----------

class AdminRegister(BaseModel):
    username: str
    password: str
    email: EmailStr

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminPublic(BaseModel):
    id: str = Field(alias="_id")
    username: str
    email: EmailStr
    created_at: datetime
    is_super_admin: bool = False

    class Config:
        populate_by_name = True

class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminPublic
    username: str

class AdminStats(BaseModel):
    total_users: int
    pending_users: int
    approved_users: int
    rejected_users: int
    active_users: int
    total_admins: int

class UserDetailResponse(BaseModel):
    id: str = Field(alias="_id")
    email: str
    name: Optional[str] = None
    status: str
    created_at: datetime
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    class Config:
        populate_by_name = True

# ---------- Web search references ----------

class Reference(BaseModel):
    title: str
    url: str
    snippet: str

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class FileInfo(BaseModel):
    filename: str
    type: str
    url: str
    size: int

class Message(BaseModel):
    chat_id: str
    role: MessageRole
    content: str
    references: Optional[List[Reference]] = None
    file: Optional[FileInfo] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    owner_id: str  # REQUIRED now

class Chat(BaseModel):
    id: str = Field(default_factory=lambda: "", alias="_id")
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    message_count: int = 0
    owner_id: str  # REQUIRED now

    class Config:
        populate_by_name = True

class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ChatRename(BaseModel):
    title: str

class MessageCreate(BaseModel):
    content: str
    original_content: Optional[str] = None
    web_search_results: Optional[str] = None

class ChatResponse(BaseModel):
    chat_id: str
    message: Message
    response: Message

class ChatListResponse(BaseModel):
    chats: List[Chat]

class ChatHistoryResponse(BaseModel):
    chat: Chat
    messages: List[Message]

class MessageRequest(BaseModel):
    question: str

class SearchQuery(BaseModel):
    query: str

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "en-IN-NeerjaIndicNeural"
    output_format: str = "audio-16khz-32kbitrate-mono-mp3"

