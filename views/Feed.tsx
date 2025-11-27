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

  // Apply filtering specifically for the feed display
  const filteredFeedVideos = videos.filter(video =>
    video.description !== 'teste' &&
    video.description !== 'vídeo' &&
    video.artist.toLowerCase() !== 'você'
  );

  // Check if the logged-in user has *any* videos stored (regardless of feed eligibility)
  const hasUserEverPosted = videos.some(video => video.artist === loggedInUserProfile.username);

  // The actual videos to display in the feed (only by the logged-in user, filtered)
  const videosToRender = filteredFeedVideos.filter(video => video.artist === loggedInUserProfile.username);

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

      if (videosToRender.length > 0) {
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
  }, [videosToRender]); // Re-run effect if videosToRender changes

  // Display message if there are no videos to show in the feed
  if (videosToRender.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-gray-400 text-lg p-4 text-center">
        {hasUserEverPosted ? (
          <>
            <p>Nenhum vídeo seu elegível para o feed foi encontrado.</p>
            <p className="mt-2 text-sm">
              Note: Vídeos com descrições "teste" ou "vídeo", ou do artista "Você" são filtrados do feed principal.
            </p>
            <p className="mt-2 text-sm">Tente postar um novo vídeo com uma descrição diferente!</p>
          </>
        ) : (
          <>
            <p>Nenhum vídeo ainda! Publique seu primeiro vídeo para desbloquear o feed.</p>
            <p className="mt-2 text-sm">Navegue até a aba "Upload" para compartilhar seu vídeo.</p>
          </>
        )}
      </div>
    );
  }

  // Render the videos
  return (
    <div
      ref={feedRef}
      className="flex flex-col h-full snap-y snap-mandatory overflow-y-auto scroll-smooth"
    >
      {videosToRender.map((video, index) => (
        <div key={video.id} className="w-full h-full flex-shrink-0 snap-start">
          <VideoPlayer video={video} isActive={index === activeVideoIndex} onVideoUpdate={onVideoUpdate} onNavigateToProfile={() => onNavigateToProfile(video.artist)} />
        </div>
      ))}
    </div>
  );
};

export default Feed;