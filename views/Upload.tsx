import React, { useState, useRef } from 'react';
import { Video } from '../types';
import Button from '../components/Button';
import { generateVideoCaption, ensureApiKeySelected } from '../services/geminiService';
import { saveVideos } from '../utils/localStorage';
import { VIDEO_PLACEHOLDER_THUMBNAIL } from '../constants';
import { v4 as uuidv4 } from 'uuid';

interface UploadProps {
  onVideoPosted: (video: Video) => void;
}

const Upload: React.FC<UploadProps> = ({ onVideoPosted }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setVideoPreviewUrl(URL.createObjectURL(file));
      setError(null); // Clear previous errors
    } else {
      setVideoPreviewUrl(null);
    }
    setCaption(''); // Reset caption when file changes
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
    setError(null);
  };

  const handleGenerateCaption = async () => {
    if (!description) {
      setError('Please provide a video description before generating a caption.');
      return;
    }

    setIsGeneratingCaption(true);
    setError(null);
    try {
      // API key selection is now handled externally, so no need to call ensureApiKeySelected here.
      const generatedCaption = await generateVideoCaption({ videoDescription: description });
      setCaption(generatedCaption);
    } catch (err) {
      console.error('Failed to generate caption:', err);
      const errorMessage = (err as Error).message || 'Failed to generate caption. Please try again or check your API key.';
      setError(errorMessage);

      // Removed specific API Key error handling, as API key selection is now handled externally.
      // The application should assume the API key is valid and configured.
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handlePostVideo = () => {
    if (!selectedFile) {
      setError('Please select a video file to upload.');
      return;
    }
    if (!description && !caption) {
      setError('Please add a description or generate a caption for your video.');
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      // Simulate real video hosting by creating a blob URL for local playback
      const videoSrc = URL.createObjectURL(selectedFile);

      const newVideo: Video = {
        id: uuidv4(), // Generate a unique ID for the video
        src: videoSrc,
        description: description,
        caption: caption || description, // Use generated caption or description if no caption
        thumbnail: VIDEO_PLACEHOLDER_THUMBNAIL + Math.floor(Math.random() * 1000), // Random thumbnail
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        artist: 'You', // For this demo, assume "You" are the artist
        file: selectedFile, // Store the file temporarily for persistence
      };

      const existingVideos = saveVideos(newVideo); // Save to local storage
      onVideoPosted(newVideo); // Notify App component
      
      // Reset form
      setSelectedFile(null);
      setVideoPreviewUrl(null);
      setDescription('');
      setCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
    } catch (err) {
      console.error('Failed to post video:', err);
      setError('Failed to post video. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-full p-4 md:p-8 overflow-y-auto bg-black text-white">
      <h2 className="text-3xl font-bold mb-6 mt-4">Upload Video</h2>

      {error && (
        <div className="bg-red-800 text-white p-3 rounded-md mb-4 w-full max-w-md text-sm">
          {error}
        </div>
      )}

      <div className="w-full max-w-md bg-gray-900 rounded-lg p-6 shadow-lg space-y-5">
        <label htmlFor="video-upload" className="block text-sm font-semibold mb-2">
          Select Video File (MP4, up to 10MB)
        </label>
        <input
          id="video-upload"
          ref={fileInputRef}
          type="file"
          accept="video/mp4"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-red-500 file:text-white
            hover:file:bg-red-600 cursor-pointer"
        />

        {videoPreviewUrl && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Video Preview</h3>
            <video src={videoPreviewUrl} controls className="w-full h-auto max-h-64 object-cover rounded-md border border-gray-700"></video>
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-semibold mb-2">
            Video Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={handleDescriptionChange}
            placeholder="What is your video about? (e.g., My cat chasing a laser pointer)"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
          ></textarea>
        </div>

        <Button
          onClick={handleGenerateCaption}
          loading={isGeneratingCaption}
          disabled={!description || isGeneratingCaption}
          fullWidth
          variant="secondary"
          size="md"
          className="mt-4"
        >
          Generate Caption with Gemini
        </Button>

        {caption && (
          <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-700">
            <h3 className="text-md font-semibold mb-1">Generated Caption:</h3>
            <p className="text-sm italic text-gray-300">{caption}</p>
          </div>
        )}

        <Button
          onClick={handlePostVideo}
          loading={isPosting}
          disabled={!selectedFile || isPosting || isGeneratingCaption}
          fullWidth
          variant="primary"
          size="lg"
          className="mt-6"
        >
          Post Video
        </Button>
      </div>
    </div>
  );
};

export default Upload;