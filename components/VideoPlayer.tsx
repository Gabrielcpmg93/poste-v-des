
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

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
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
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={video.src}
        loop
        playsInline
        muted={isMuted} // Control muted state from component
        onClick={togglePlay}
        className="w-full h-full object-contain md:object-cover aspect-[9/16]"
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
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M9.383 1.052A1 1 0 0110 2v16a1 1 0 01-1.621.764L5 15H3a1 1 0 01-1-1V6a1 1 0 011-1h2l3.383-2.764A1 1 0 019.383 1.052zM16 10a4 4 0 01-7.054 2.502l1.674-1.672A2 2 0 0013.134 10H16z" clipRule="evenodd"></path>
                  <path fillRule="evenodd" d="M13.134 10L14.475 8.659A5 5 0 0011 5H9.383L5.052 1.052A1 1 0 016.383 0L10 3.617l3.617-3.617a1 1 0 011.621.764L13.134 10zM14 10a4 4 0 01-7.054 2.502L13.134 10z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M16 10a4 4 0 01-7.054 2.502l1.674-1.672A2 2 0 0013.134 10H16z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M16 10a4 4 0 01-7.054 2.502L13.134 10z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M9.383 1.052A1 1 0 0110 2v16a1 1 0 01-1.621.764L5 15H3a1 1 0 01-1-1V6a1 1 0 011-1h2l3.383-2.764A1 1 0 019.383 1.052zM14 8a6 6 0 010 4v-4zm-7 8.243V4.757L3.052 7.052A1 1 0 002 8v4a1 1 0 001.052.948L7 16.243zM16.138 11.5a2.001 2.001 0 010-3l1.838-1.837a1 1 0 111.414 1.414L17.552 10l1.838 1.838a1 1 0 01-1.414 1.414l-1.838-1.838z" clipRule="evenodd"></path>
                </svg>
              )}
            </Button>
            {/* Mute state is not a number, so no span for it */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;