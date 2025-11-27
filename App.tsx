
import React, { useState, useEffect, useCallback } from 'react';
import { View, Video } from './types';
import NavigationBar from './components/NavigationBar';
import Feed from './views/Feed';
import Upload from './views/Upload';
import Profile from './views/Profile';
// Import video utility functions from local storage
import { loadVideos, addVideo, updateVideo } from './utils/localStorage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [videos, setVideos] = useState<Video[]>([]);
  const [viewingProfileUsername, setViewingProfileUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedVideos = loadVideos();
    if (storedVideos) {
      setVideos(storedVideos);
    }
  }, []);

  const handleVideoPosted = (newVideo: Video) => {
    setVideos((prevVideos) => {
      const updatedList = [newVideo, ...prevVideos];
      // Use the imported addVideo function
      addVideo(newVideo);
      return updatedList;
    });
    setCurrentView('feed');
  };

  const handleVideoUpdate = useCallback((updatedVideo: Video) => {
    setVideos(prevVideos => {
      const newVideos = prevVideos.map(video =>
        video.id === updatedVideo.id ? updatedVideo : video
      );
      // Use the imported updateVideo function
      updateVideo(updatedVideo);
      return newVideos;
    });
  }, []);

  const handleNavigateToProfile = useCallback((username: string | null) => {
    setViewingProfileUsername(username);
    setCurrentView('profile');
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'feed':
        return <Feed videos={videos} onVideoUpdate={handleVideoUpdate} onNavigateToProfile={handleNavigateToProfile} />;
      case 'upload':
        return <Upload onVideoPosted={handleVideoPosted} />;
      case 'profile':
        return <Profile videos={videos} viewingUsername={viewingProfileUsername} />;
      default:
        return <Feed videos={videos} onVideoUpdate={handleVideoUpdate} onNavigateToProfile={handleNavigateToProfile} />;
    }
  };

  return (
    <div className="relative flex flex-col h-screen max-h-screen overflow-hidden">
      <main className="flex-1 overflow-hidden">{renderView()}</main>
      <NavigationBar currentView={currentView} onSelectView={setCurrentView} />
    </div>
  );
};

export default App;
