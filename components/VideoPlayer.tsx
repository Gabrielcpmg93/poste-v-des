
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Video } from '../types';
import Button from './Button';

interface VideoPlayerProps {
  video: Video;
  isActive: boolean; // Indicates if this video is currently in the viewport
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPlayPauseOverlay, setShowPlayPauseOverlay] = useState(false);

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
      onClick={togglePlay} // <<<<<<<<<< Moved onClick here to cover the whole player area
    >
      <video
        ref={videoRef}
        src={video.src}
        loop
        playsInline
        // muted={isMuted} removed - controlled imperatively in useEffect and toggleMute
        // onClick={togglePlay} removed - moved to parent div
        className="w-full h-full object-cover aspect-[9/16]" // <<<<<<<<<< Corrected class
      >
        Your browser does not support the video tag.
      </video>

      {/* Play/Pause Overlay */}
      {showPlayPauseOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300">
          {isPlaying ? (
            <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
          ) : (
            <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
            </svg>
          )}
        </div>
      )}

      {/* Video Overlay and Controls */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 bg-gradient-to-t from-black/50 via-transparent to-transparent">
        {/* User Info and Description */}
        <div className="text-white mb-8 md:mb-12 max-w-[80%]">
          <p className="font-bold text-lg">@{video.artist}</p>
          <p className="text-sm mt-1">{video.caption}</p>
        </div>

        {/* Action Buttons (Like, Comment, Share, Mute) */}
        <div className="absolute right-4 bottom-24 flex flex-col space-y-4">
          <div className="flex flex-col items-center">
            <Button variant="ghost" className="p-2 rounded-full text-white">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
              </svg>
            </Button>
            <span className="text-sm font-semibold">{video.likes}</span>
          </div>
          <div className="flex flex-col items-center">
            <Button variant="ghost" className="p-2 rounded-full text-white">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.767-1.39L2 17l1.674-3.092A9.124 9.124 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"></path>
              </svg>
            </Button>
            <span className="text-sm font-semibold">{video.comments}</span>
          </div>
          <div className="flex flex-col items-center">
            <Button variant="ghost" className="p-2 rounded-full text-white">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.742l4.94-2.47C13.456 7.68 14.163 8 15 8z"></path>
              </svg>
            </Button>
            <span className="text-sm font-semibold">{video.shares}</span>
          </div>
          <div className="flex flex-col items-center">
            <Button variant="ghost" className="p-2 rounded-full text-white" onClick={toggleMute} aria-label={isMuted ? 'Unmute video' : 'Mute video'}>
              {isMuted ? (
                // Simplified mute icon
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M9.383 1.052A1 1 0 0110 2v16a1 1 0 01-1.621.764L5 15H3a1 1 0 01-1-1V6a1 1 0 011-1h2l3.383-2.764A1 1 0 019.383 1.052z" clipRule="evenodd"></path>
                  <path stroke="currentColor" strokeWidth="2" d="M14 7l-8 8M6 7l8 8" /> {/* X mark */}
                </svg>
              ) : (
                // Simplified unmute icon
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M9.383 1.052A1 1 0 0110 2v16a1 1 0 01-1.621.764L5 15H3a1 1 0 01-1-1V6a1 1 0 011-1h2l3.383-2.764A1 1 0 019.383 1.052zM14 8a6 6 0 010 4V8z" clipRule="evenodd"></path>
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;