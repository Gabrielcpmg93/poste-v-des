

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video } from '../types';
import Button from '../components/Button';
import { generateVideoCaption } from '../services/geminiService';
import { loadProfileData } from '../utils/localStorage';
import { VIDEO_PLACEHOLDER_THUMBNAIL } from '../constants';
import { v4 as uuidv4 } from 'uuid';

interface UploadProps {
  onVideoPosted: (video: Video) => void;
}

const Upload: React.FC<UploadProps> = ({ onVideoPosted }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null); // This will now hold Base64 data
  const [description, setDescription] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New states for thumbnail selection
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTimeForThumbnail, setCurrentTimeForThumbnail] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Ref for canvas to capture frame

  // Function to capture the current frame of the video and set it as thumbnail
  const captureFrame = useCallback(() => {
    const video = videoPreviewRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg'); // Get JPEG data URL
        setThumbnailPreviewUrl(base64Image);
      }
    }
  }, []);

  // Set video duration and capture initial thumbnail when video metadata loads
  const handleLoadedMetadata = () => {
    if (videoPreviewRef.current) {
      setVideoDuration(videoPreviewRef.current.duration);
      videoPreviewRef.current.currentTime = 0; // Reset to start
      // Give it a moment to render the frame before capturing
      setTimeout(captureFrame, 100); 
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setError(null); // Clear previous errors

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      setCaption(''); // Reset caption when file changes
      setThumbnailPreviewUrl(null); // Reset thumbnail
      setCurrentTimeForThumbnail(0); // Reset thumbnail time
      setVideoDuration(0); // Reset duration
    } else {
      setVideoPreviewUrl(null);
      setThumbnailPreviewUrl(null);
      setCurrentTimeForThumbnail(0);
      setVideoDuration(0);
    }
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
      const generatedCaption = await generateVideoCaption({ videoDescription: description });
      setCaption(generatedCaption);
    } catch (err) {
      console.error('Failed to generate caption:', err);
      const errorMessage = (err as Error).message || 'Failed to generate caption. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handlePostVideo = () => {
    if (!selectedFile || !videoPreviewUrl) {
      setError('Please select a video file to upload.');
      return;
    }
    if (!description && !caption) {
      setError('Please add a description or generate a caption for your video.');
      return;
    }
    if (!thumbnailPreviewUrl) {
      setError('Please capture a thumbnail for your video.');
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      const currentUserProfile = loadProfileData();
      
      const newVideo: Video = {
        id: uuidv4(),
        src: videoPreviewUrl,
        description: description,
        caption: caption || description,
        thumbnail: thumbnailPreviewUrl, // Use the captured thumbnail
        likesCount: 0,
        commentsCount: 0,
        shares: 0,
        artist: currentUserProfile.username,
        file: selectedFile,
        commentsData: [],
      };

      onVideoPosted(newVideo);

      // Reset form
      setSelectedFile(null);
      setVideoPreviewUrl(null);
      setDescription('');
      setCaption('');
      setThumbnailPreviewUrl(null);
      setCurrentTimeForThumbnail(0);
      setVideoDuration(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
        <div className="bg-red-800 text-white p-3 rounded-md mb-4 w-full max-w-md text-sm" role="alert">
          {error}
        </div>
      )}

      <div className="w-full max-w-md bg-gray-900 rounded-lg p-6 shadow-lg space-y-5">
        <label htmlFor="video-upload" className="block text-sm font-semibold mb-2">
          Selecione o arquivo de vídeo (MP4, até 10MB)
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
          aria-label="Selecionar arquivo de vídeo"
        />

        {videoPreviewUrl && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Pré-visualização do Vídeo</h3>
            <div className="relative w-full aspect-video rounded-md border border-gray-700 overflow-hidden">
              <video
                ref={videoPreviewRef}
                src={videoPreviewUrl}
                controls={false} // Hide native controls
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={() => setCurrentTimeForThumbnail(videoPreviewRef.current?.currentTime || 0)}
                className="w-full h-full object-contain"
                aria-label="Pré-visualização do vídeo para seleção de capa"
              ></video>
              <canvas ref={canvasRef} className="hidden"></canvas> {/* Hidden canvas for frame capture */}
            </div>

            {videoDuration > 0 && (
              <div className="mt-4">
                <label htmlFor="thumbnail-scrubber" className="block text-sm font-semibold mb-2">
                  Escolha um momento para a capa:
                </label>
                <input
                  id="thumbnail-scrubber"
                  type="range"
                  min="0"
                  max={videoDuration}
                  step="0.1"
                  value={currentTimeForThumbnail}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value);
                    setCurrentTimeForThumbnail(newTime);
                    if (videoPreviewRef.current) {
                      videoPreviewRef.current.currentTime = newTime;
                    }
                  }}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                  aria-label="Controlador de tempo para seleção de capa"
                />
                <span className="text-xs text-gray-400 block text-right mt-1">
                  {currentTimeForThumbnail.toFixed(1)}s / {videoDuration.toFixed(1)}s
                </span>
                <Button
                  onClick={captureFrame}
                  fullWidth
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  aria-label="Capturar capa do vídeo"
                >
                  Capturar Capa do Vídeo
                </Button>
              </div>
            )}

            {thumbnailPreviewUrl && (
              <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-700 text-center">
                <h3 className="text-md font-semibold mb-2">Capa do Vídeo Selecionada:</h3>
                <img
                  src={thumbnailPreviewUrl}
                  alt="Capa do vídeo"
                  className="w-40 h-auto object-contain rounded-md mx-auto border border-gray-600"
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-semibold mb-2">
            Descrição do Vídeo
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Sobre o que é o seu vídeo? (ex: Meu gato caçando um ponteiro laser)"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
            aria-label="Campo para descrição do vídeo"
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
          aria-label="Gerar legenda com Gemini"
        >
          Gerar Legenda com Gemini
        </Button>

        {caption && (
          <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-700">
            <h3 className="text-md font-semibold mb-1">Legenda Gerada:</h3>
            <p className="text-sm italic text-gray-300">{caption}</p>
          </div>
        )}

        <Button
          onClick={handlePostVideo}
          loading={isPosting}
          disabled={!selectedFile || isPosting || isGeneratingCaption || !thumbnailPreviewUrl}
          fullWidth
          variant="primary"
          size="lg"
          className="mt-6"
          aria-label="Postar vídeo"
        >
          Postar Vídeo
        </Button>
      </div>
    </div>
  );
};

export default Upload;