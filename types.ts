
export interface Video {
  id: string;
  src: string; // URL for the video
  description: string;
  caption: string; // Generated caption by Gemini
  thumbnail: string; // URL for the thumbnail
  likes: number;
  comments: number;
  shares: number;
  artist: string;
  file?: File; // Optional: for client-side representation before upload
}

export type View = 'feed' | 'upload' | 'profile';