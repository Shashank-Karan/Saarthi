// Frontend API types for Saarthi Python backend
import { z } from "zod";

export interface User {
  id: string;
  username: string;
  name: string;
  created_at: string;
}

export interface InsertUser {
  username: string;
  name: string;
  password: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  image_url?: string;
  video_url?: string;
  likes: number;
  created_at: string;
}

export interface PostWithAuthor extends Post {
  author: User;
  comments: number;
}

export interface InsertPost {
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: string;
}

export interface CommentWithAuthor extends Comment {
  author: User;
}

export interface InsertComment {
  content: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  is_ai_response: boolean;
  created_at: string;
}

export interface ChatMessageWithUser extends ChatMessage {
  user: User;
}

export interface InsertChatMessage {
  content: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  author_id: string;
  mood?: string;
  created_at: string;
}

export interface InsertJournalEntry {
  title: string;
  content: string;
  mood?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// Zod schemas for form validation
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const insertPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  image_url: z.string().optional(),
  video_url: z.string().optional()
});

export const insertCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty")
});

export const insertChatMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty")
});

export const insertJournalEntrySchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
  mood: z.string().optional()
});