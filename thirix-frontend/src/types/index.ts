export interface User {
  _id:string; username:string; email:string; firstName:string; lastName:string;
  motherLastName:string; birthDate:string; gender:string; profession:string;
  bio:string; avatar:string; coverImage:string; followers:string[]; following:string[];
  followersCount?: number; followingCount?: number;
  savedPosts:string[]; interests:string[]; isVerified:boolean; location?:string;
  website?:string; createdAt:string; updatedAt:string;
  _count?: { followers?: number; following?: number };
}
export interface Media {
  fileType: string;
  url: string;
  type: 'image' | 'video';
}
export interface Post {
  _id:string; author:User|string; content:string; media:Media[]; likes:string[];
  saved?: boolean;
  commentsCount:number; taggedUsers:string[]; hashtags:string[]; location:string;
  visibility:'public'|'private'; createdAt:string; updatedAt:string;
}
export interface Comment { _id:string; post:string; author:User|string; content:string; createdAt:string }
export interface Conversation {
  _id:string; participants:User[]|string[]; lastMessage:string;
  lastMessageSender:string; createdAt:string; updatedAt:string;
}
export interface Message {
  _id:string; conversation:string; sender:User|string; text:string;
  attachments:Media[]; isRead:boolean; createdAt:string;
}
export interface AuthUser { _id:string; username:string; email:string; firstName:string; lastName:string; avatar:string }
