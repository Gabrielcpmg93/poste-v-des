
export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface Video {
  id: string;
  src: string; // URL for the video
  description: string;
  caption: string; // Generated caption by Gemini
  thumbnail: string; // URL for the thumbnail
  likesCount: number; // Renamed from 'likes'
  commentsCount: number; // Renamed from 'comments'
  shares: number;
  artist: string;
  file?: File; // Optional: for client-side representation before upload
  commentsData: Comment[]; // New: Stores actual comment objects
}

export interface Profile {
  id: string;
  username: string;
  bio: string;
  profilePicture: string; // Base64 string of the image
  displayId: string; // New: User-facing ID, inspired by the reference image
}

export type View = 'feed' | 'upload' | 'profile';