
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Video, Comment } from '../types';
import Button from './Button';
import { loadLikedVideoIds, saveLikedVideoIds } from '../utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

interface VideoPlayerProps {
  video: Video;
  isActive: boolean; // Indicates if this video is currently in the viewport
  onVideoUpdate: (video: Video) => void; // Callback to update video in App state and localStorage
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, isActive, onVideoUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPlayPauseOverlay, setShowPlayPauseOverlay] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Load liked status from localStorage
  useEffect(() => {
    const likedIds = loadLikedVideoIds();
    setIsLiked(likedIds.has(video.id));
  }, [video.id]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((e) => console.error("Error playing video:", e));
      }
      setIsPlaying(!isPlaying);
      setShowPlayPauseOverlay(true); // Show overlay temporarily
      setTimeout(() => setShowPlayPauseOverlay(false), 500); // Hide after 0.5s
    }
  }, [isPlaying]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent play/pause when clicking mute button
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent play/pause when clicking like button
    let currentLikedIds = loadLikedVideoIds();
    let updatedVideo = { ...video };

    if (isLiked) {
      updatedVideo.likesCount -= 1;
      currentLikedIds.delete(video.id);
    } else {
      updatedVideo.likesCount += 1;
      currentLikedIds.add(video.id);
    }

    setIsLiked(!isLiked);
    saveLikedVideoIds(currentLikedIds);
    onVideoUpdate(updatedVideo); // Update video in parent state and localStorage
  }, [isLiked, video, onVideoUpdate]);

  const handleCommentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent play/pause when clicking comment button
    setShowCommentsModal(true);
  }, []);

  const handleAddComment = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      const newComment: Comment = {
        id: uuidv4(),
        username: 'Você', // For simplicity, assume the current user is 'Você'
        text: newCommentText.trim(),
        timestamp: Date.now(),
      };
      const updatedVideo = {
        ...video,
        commentsData: [...video.commentsData, newComment],
        commentsCount: video.commentsCount + 1,
      };
      onVideoUpdate(updatedVideo);
      setNewCommentText('');
    }
  }, [newCommentText, video, onVideoUpdate]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.muted = true; // Ensure video starts muted
        setIsMuted(true);
        videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
          console.log("Autoplay prevented or error:", e);
          setIsPlaying(false); // Set to false if autoplay fails
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        videoRef.current.currentTime = 0; // Reset video to start
      }
    }
  }, [isActive]);

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={video.src}
        loop
        playsInline
        className="w-full h-full object-cover aspect-[9/16]"
      >
        Your browser does not support the video tag.
      </video>

      {/* Play/Pause Overlay */}
      {showPlayPauseOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300">
          {isPlaying ? (
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 7H11V17H8V7ZM13 7H16V17H13V7Z" />
            </svg>
          ) : (
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" />
            </svg>
          )}
        </div>
      )}

      {/* Video Overlay and Controls */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 bg-gradient-to-t from-black/70 via-transparent to-transparent">
        {/* Removed Top Caption */}

        {/* Bottom Left User Info and Description */}
        <div className="absolute bottom-32 md:bottom-36 left-4 text-white z-10 max-w-[calc(100%-100px)]">
          {/* Removed redundant video.artist display */}
          <p className="font-semibold text-lg md:text-xl mt-1" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            @{video.artist} {/* Using artist as username for now */}
          </p>
          <p className="text-base md:text-lg mt-1" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            {video.description}
          </p>
        </div>

        {/* Action Buttons (Right Side) */}
        <div className="absolute right-4 bottom-32 md:bottom-36 flex flex-col items-center space-y-4 z-10">
          {/* Like Button */}
          <div className="flex flex-col items-center">
            <Button variant="ghost" className={`p-0 ${isLiked ? 'text-red-500' : 'text-white'}`} onClick={handleLikeClick}>
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"></path>
              </svg>
            </Button>
            <span className="text-sm font-bold text-white mt-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{video.likesCount}</span>
          </div>
          {/* Comment Button */}
          <div className="flex flex-col items-center">
            <Button variant="ghost" className="p-0 text-white" onClick={handleCommentClick}>
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H18L22 22L21.99 4C21.99 2.9 21.1 2 20 2ZM20 16H6V4H20V16Z"></path>
              </svg>
            </Button>
            <span className="text-sm font-bold text-white mt-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{video.commentsCount}</span>
          </div>
          {/* Share Button */}
          <div className="flex flex-col items-center">
            <Button variant="ghost" className="p-0 text-white" onClick={(e) => e.stopPropagation()}> {/* Stop propagation for share */}
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.15C16.44 7.62 17.12 7.92 18 7.92C19.66 7.92 21 6.58 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.85C7.56 9.38 6.88 9.08 6 9.08C4.34 9.08 3 10.42 3 12C3 13.58 4.34 14.92 6 14.92C6.88 14.92 7.56 14.62 8.04 14.15L15.09 18.3C15.04 18.53 15 18.76 15 19C15 20.66 16.34 22 18 22C19.66 22 21 20.66 21 19C21 17.34 19.66 16.08 18 16.08Z"></path>
              </svg>
            </Button>
            <span className="text-sm font-bold text-white mt-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{video.shares}</span>
          </div>
        </div>

        {/* Mute Button (Bottom Right, separate) */}
        <div className="absolute right-4 bottom-20 md:bottom-24 flex flex-col items-center z-10"> {/* Adjusted bottom to be above nav bar, separate from action buttons */}
          <Button variant="ghost" className="p-0 text-white" onClick={toggleMute} aria-label={isMuted ? 'Unmute video' : 'Mute video'}>
            {isMuted ? (
              // Mute icon
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.27 3L3 4.27L7.73 9H3V15H7.73L12 19.27V11.27L17.73 17L19 18.27L20.27 19.55L21.55 20.82L22.83 22.1L24.1 23.37L22.83 24.65L21.55 23.37L20.27 22.1L19 20.82L17.73 19.55L12 13.82L4.27 6.1L3 4.82L4.27 3ZM12 4.09V6.1L9.12 3.22L12 4.09Z M16.5 12C16.5 10.23 15.48 8.78 14 8.19V10.37L16.5 12ZM19 12C19 10.46 18.06 9.17 16.5 8.5L18.06 7C19.38 7.74 20.27 8.92 20.27 10.37L20.27 13.63C20.27 15.08 19.38 16.26 18.06 17L16.5 15.81C18.06 15.14 19 13.86 19 12Z"/>
              </svg>
            ) : (
              // Unmute icon
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9H7L12 4V20L7 15H3V9ZM16.5 12C16.5 10.23 15.48 8.78 14 8.19V15.81C15.48 15.22 16.5 13.77 16.5 12ZM19 12C19 10.46 18.06 9.17 16.5 8.5L18.06 7C19.38 7.74 20.27 8.92 20.27 10.37V13.63C20.27 15.08 19.38 16.26 18.06 17L16.5 15.81C18.06 15.14 19 13.86 19 12Z"/>
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-end z-30" onClick={() => setShowCommentsModal(false)}>
          <div className="bg-gray-900 w-full max-w-md max-h-[80vh] rounded-t-3xl p-6 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Comentários ({video.commentsCount})</h3>
              <Button variant="ghost" onClick={() => setShowCommentsModal(false)} aria-label="Fechar comentários">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {video.commentsData.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nenhum comentário ainda. Seja o primeiro!</p>
              ) : (
                video.commentsData.slice().sort((a, b) => a.timestamp - b.timestamp).map((comment) => (
                  <div key={comment.id} className="bg-gray-800 p-3 rounded-lg">
                    <p className="font-semibold text-white text-sm">@{comment.username}</p>
                    <p className="text-gray-300 text-base mt-1">{comment.text}</p>
                    <span className="text-xs text-gray-500 block mt-1">
                      {new Date(comment.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="mt-6 flex space-x-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Adicione um comentário..."
                className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-full focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
                aria-label="Campo para adicionar novo comentário"
              />
              <Button type="submit" variant="primary" disabled={!newCommentText.trim()}>
                Postar
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;