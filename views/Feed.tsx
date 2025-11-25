
import React, { useRef, useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import { Video } from '../types';

interface FeedProps {
  videos: Video[];
  onVideoUpdate: (video: Video) => void; // New prop for updating videos
}

const Feed: React.FC<FeedProps> = ({ videos, onVideoUpdate }) => {
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
          threshold: 0.75, // Trigger when 75% of the item is visible
          root: feedRef.current, // Observe within the feed container
          rootMargin: '0px',
        }
      );

      // Attach observer to each video element
      Array.from(feedRef.current.children).forEach((child, index) => {
        if (observer.current) {
          // Explicitly cast `child` to HTMLElement to ensure `setAttribute` is recognized
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
  }, [videos]); // Re-run observer setup if videos change

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
          <VideoPlayer video={video} isActive={index === activeVideoIndex} onVideoUpdate={onVideoUpdate} />
        </div>
      ))}
    </div>
  );
};

export default Feed;
