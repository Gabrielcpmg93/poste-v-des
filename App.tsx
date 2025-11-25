import React, { useState, useEffect } from 'react';
import { View, Video } from './types';
import NavigationBar from './components/NavigationBar';
import Feed from './views/Feed';
import Upload from './views/Upload';
import { loadVideos } from './utils/localStorage';
// ensureApiKeySelected is deprecated and no longer needed here as per API guidelines.

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [videos, setVideos] = useState<Video[]>([]);
  // Removed hasCheckedApiKey state, as API key selection is now handled externally.

  useEffect(() => {
    // Load videos from local storage on initial mount
    const storedVideos = loadVideos();
    if (storedVideos) {
      setVideos(storedVideos);
    }

    // Removed API key selection logic from here.
    // The API key is now assumed to be pre-configured in process.env.API_KEY
    // and available without user interaction.
  }, []);

  const handleVideoPosted = (newVideo: Video) => {
    setVideos((prevVideos) => [newVideo, ...prevVideos]);
    setCurrentView('feed'); // Go back to feed after posting
  };

  const renderView = () => {
    // Removed conditional rendering for API key check.
    // The application proceeds assuming the API key is ready.

    switch (currentView) {
      case 'feed':
        return <Feed videos={videos} />;
      case 'upload':
        return <Upload onVideoPosted={handleVideoPosted} />;
      case 'profile':
        return (
          <div className="flex items-center justify-center h-full text-white text-lg">
            <p>Profile view (Coming Soon!)</p>
          </div>
        );
      default:
        return <Feed videos={videos} />;
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