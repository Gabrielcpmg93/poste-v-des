
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Story } from '../types';
import Button from './Button';

interface StoryViewerModalProps {
  stories: Story[];
  onClose: () => void;
  initialStoryIndex?: number;
}

const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ stories, onClose, initialStoryIndex = 0 }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0); // 0 to 100 for current story's progress
  const storyDuration = 6000; // 6 seconds per story if no audio, or audio duration
  const progressIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Synchronize currentStoryIndex with initialStoryIndex and stories prop changes
  useEffect(() => {
    if (stories.length === 0) {
      // If stories become empty, reset index to 0. The top-level check will close the modal.
      setCurrentStoryIndex(0);
      return;
    }
    // Ensure index is within bounds of updated stories array and update if initialStoryIndex suggests a different start.
    const newIndex = Math.min(Math.max(0, initialStoryIndex), stories.length - 1);
    if (newIndex !== currentStoryIndex) {
      setCurrentStoryIndex(newIndex);
    }
  }, [initialStoryIndex, stories.length]); // Depend on stories.length to detect changes in content count

  const currentStory = stories[currentStoryIndex];

  // Fix: Declare handleNextStory and handlePreviousStory before startProgress
  const handleNextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      onClose(); // Close if it's the last story
    }
  }, [currentStoryIndex, stories.length, onClose]);

  const handlePreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  }, [currentStoryIndex]);

  // Fix: Add handleNextStory to the dependency array of startProgress
  const startProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const startTime = Date.now();
    let duration = storyDuration; // Default duration
    
    // Ensure audioRef.current is valid and has a duration before using it.
    // If audio isn't playing or doesn't have a duration, fall back to default storyDuration.
    if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended && isFinite(audioRef.current.duration)) {
      duration = audioRef.current.duration * 1000;
    }

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / duration) * 100;
      setProgress(Math.min(newProgress, 100));

      if (elapsed >= duration) {
        clearInterval(progressIntervalRef.current!);
        handleNextStory();
      }
    }, 50); // Update every 50ms
  }, [storyDuration, handleNextStory]); // Dependencies: storyDuration and handleNextStory (which is useCallback)

  useEffect(() => {
    // If stories array is empty or currentStoryIndex is out of bounds, close the modal.
    // This is a robust check to handle transient states where data might not be ready.
    if (!currentStory) {
      onClose();
      return;
    }

    setProgress(0); // Reset progress for new story

    // Stop and reset previous audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = ''; // Clear src to ensure fresh load and stop memory usage
    }

    // Play current story's audio
    if (currentStory.audioUrl && audioRef.current) {
      audioRef.current.src = currentStory.audioUrl;
      audioRef.current.load(); // Load the audio
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }

    startProgress(); // Start visual progress timer

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Clear src
      }
    };
  }, [currentStory, onClose, startProgress]); // Depend on currentStory object directly

  const handleAudioEnded = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    handleNextStory();
  };

  // If no stories are available, or become unavailable during interaction, close the modal.
  if (stories.length === 0 || !currentStory) {
    onClose();
    return null; // Don't render anything
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Progress Indicators */}
      <div className="absolute top-0 left-0 right-0 flex space-x-1 p-2 z-10 bg-gradient-to-b from-black/50 to-transparent">
        {stories.map((story, idx) => (
          <div key={story.id} className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-50 ease-linear"
              style={{ width: idx < currentStoryIndex ? '100%' : (idx === currentStoryIndex ? `${progress}%` : '0%') }}
            ></div>
          </div>
        ))}
      </div>

      {/* Story Content */}
      <img src={currentStory.imageUrl} alt="Story" className="w-full h-full object-cover" />
      <audio ref={audioRef} onEnded={handleAudioEnded} hidden={true} preload="auto"></audio>

      {/* User Info & Close Button */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 text-white">
        <div className="flex items-center space-x-2">
          {/* Could add profile picture here */}
          <span className="font-semibold text-lg">@{currentStory.username}</span>
        </div>
        <Button variant="ghost" iconOnly size="md" onClick={onClose} aria-label="Fechar story">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </Button>
      </div>

      {/* Navigation Areas */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full" onClick={handlePreviousStory} aria-label="História anterior"></div>
        <div className="w-1/2 h-full" onClick={handleNextStory} aria-label="Próxima história"></div>
      </div>
    </div>
  );
};

export default StoryViewerModal;