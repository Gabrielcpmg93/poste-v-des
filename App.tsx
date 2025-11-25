
import React, { useState, useEffect } from 'react';
import { View, Video } from './types';
import NavigationBar from './components/NavigationBar';
import Feed from './views/Feed';
import Upload from './views/Upload';
import { loadVideos } from './utils/localStorage';
import { ensureApiKeySelected } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [videos, setVideos] = useState<Video[]>([]);
  const [hasCheckedApiKey, setHasCheckedApiKey] = useState(false);

  useEffect(() => {
    // Load videos from local storage on initial mount
    const storedVideos = loadVideos();
    if (storedVideos) {
      setVideos(storedVideos);
    }

    // Ensure API key is selected on app load
    const checkApiKey = async () => {
      try {
        await ensureApiKeySelected();
      } catch (error) {
        console.error("API Key selection failed:", error);
        // Optionally, inform the user or keep them on a landing page
      } finally {
        setHasCheckedApiKey(true);
      }
    };
    checkApiKey();
  }, []);

  const handleVideoPosted = (newVideo: Video) => {
    setVideos((prevVideos) => [newVideo, ...prevVideos]);
    setCurrentView('feed'); // Go back to feed after posting
  };

  const renderView = () => {
    if (!hasCheckedApiKey && currentView === 'upload') {
      // If API key check is still pending, maybe show a loading or selection prompt
      return (
        <div className="flex flex-col items-center justify-center h-full text-white text-lg">
          <p>Preparing for upload...</p>
          <p>Please select your API key if prompted.</p>
        </div>
      );
    }

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