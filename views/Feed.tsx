
import React, { useRef, useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import { Video, Profile as ProfileType } from '../types';

interface FeedProps {
  videos: Video[];
  onVideoUpdate: (video: Video) => void;
  onNavigateToProfile: (username: string) => void;
  loggedInUserProfile: ProfileType; // New prop for the logged-in user's profile
}

const Feed: React.FC<FeedProps> = ({ videos, onVideoUpdate, onNavigateToProfile, loggedInUserProfile }) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Determine if the logged-in user has posted any videos
  const hasLoggedInUserPostedVideos = videos.some(video => video.artist === loggedInUserProfile.username);

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

      // Only observe if the logged-in user has posted videos, otherwise the feed will be empty
      if (hasLoggedInUserPostedVideos) {
        Array.from(feedRef.current.children).forEach((child, index) => {
          if (observer.current) {
            (child as HTMLElement).setAttribute('data-index', index.toString());
            observer.current.observe(child);
          }
        });
      }
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [videos, hasLoggedInUserPostedVideos]); // Re-run effect if videos or user's posting status changes

  // Display message if logged-in user hasn't posted any videos
  if (!hasLoggedInUserPostedVideos) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-gray-400 text-lg p-4 text-center">
        <p>No videos yet! Post your first video to unlock the feed.</p>
        <p className="mt-2 text-sm">Navigate to the "Upload" tab to share your video.</p>
      </div>
    );
  }

  // If the logged-in user has posted videos but there are no actual videos to display (e.g., all filtered out)
  // This case might happen if 'hasLoggedInUserPostedVideos' is true but 'videos' array becomes empty due to filtering.
  if (videos.length === 0 && hasLoggedInUserPostedVideos) {
     return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-gray-400 text-lg p-4 text-center">
        <p>No videos to display after filtering.</p>
        <p className="mt-2 text-sm">Try posting new content!</p>
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
