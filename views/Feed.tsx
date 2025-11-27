
import React, { useRef, useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import { Video } from '../types';

interface FeedProps {
  videos: Video[];
  onVideoUpdate: (video: Video) => void;
  onNavigateToProfile: (username: string) => void; // Updated prop type
}

const Feed: React.FC<FeedProps> = ({ videos, onVideoUpdate, onNavigateToProfile }) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (feedRef.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = parseInt(entry.target.getAttribute('data-index') || '0');
              setActiveVideoIndex(index);
            }
          });
        },
        {
          threshold: 0.75,
          root: feedRef.current,
          rootMargin: '0px',
        }
      );

      Array.from(feedRef.current.children).forEach((child, index) => {
        if (observer.current) {
          (child as HTMLElement).setAttribute('data-index', index.toString());
          observer.current.observe(child);
        }
      });
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [videos]);

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-gray-400 text-lg p-4 text-center">
        <p>No videos yet! Be the first to post.</p>
        <p className="mt-2 text-sm">Navigate to the "Upload" tab to share your video.</p>
      </div>
    );
  }

  return (
    <div
      ref={feedRef}
      className="flex flex-col h-full snap-y snap-mandatory overflow-y-auto scroll-smooth"
    >
      {videos.map((video, index) => (
        <div key={video.id} className="w-full h-full flex-shrink-0 snap-start">
          <VideoPlayer video={video} isActive={index === activeVideoIndex} onVideoUpdate={onVideoUpdate} onNavigateToProfile={() => onNavigateToProfile(video.artist)} />
        </div>
      ))}
    </div>
  );
};

export default Feed;
