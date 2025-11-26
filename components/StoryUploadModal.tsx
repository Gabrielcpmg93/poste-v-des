

import React, { useState, useRef } from 'react';
import Button from './Button';
import { Story } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface StoryUploadModalProps {
  onClose: () => void;
  onPublish: (story: Omit<Story, 'id' | 'expiryTime'>) => void;
  userId: string;
  username: string;
}

const StoryUploadModal: React.FC<StoryUploadModalProps> = ({ onClose, onPublish, userId, username }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (e.g., JPG, PNG).');
        setImageFile(null);
        setImagePreviewUrl(null);
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file (e.g., MP3, WAV).');
        setAudioFile(null);
        setAudioPreviewUrl(null);
        return;
      }
      setAudioFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAudioPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setAudioFile(null);
      setAudioPreviewUrl(null);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = async () => {
    if (!imageFile) {
      setError('Please select an image for your story.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await convertFileToBase64(imageFile);
      let audioUrl: string | undefined;

      if (audioFile) {
        audioUrl = await convertFileToBase64(audioFile);
      }

      onPublish({
        userId,
        username,
        imageUrl,
        audioUrl,
        timestamp: Date.now(),
      });
      onClose(); // Close modal after publishing
    } catch (err) {
      console.error('Error publishing story:', err);
      setError('Failed to publish story. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 w-full max-w-lg rounded-lg shadow-xl p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Criar Story</h2>
          <Button variant="ghost" iconOnly size="md" onClick={onClose} aria-label="Fechar">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </Button>
        </div>

        {error && (
          <div className="bg-red-800 text-white p-3 rounded-md mb-4 text-sm" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-4 flex-1">
          {/* Image Upload */}
          <div>
            <label htmlFor="story-image-upload" className="block text-sm font-semibold mb-2 text-gray-300">
              Selecione uma Imagem para o Story <span className="text-red-500">*</span>
            </label>
            <input
              id="story-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-red-500 file:text-white
                hover:file:bg-red-600 cursor-pointer"
              aria-label="Selecionar imagem para o story"
            />
            {imagePreviewUrl && (
              <div className="mt-4 flex flex-col items-center">
                <img src={imagePreviewUrl} alt="Pré-visualização da imagem do story" className="max-w-full h-48 object-contain rounded-md border border-gray-700" />
                <span className="text-xs text-gray-400 mt-2">Imagem selecionada</span>
              </div>
            )}
          </div>

          {/* Audio Upload */}
          <div>
            <label htmlFor="story-audio-upload" className="block text-sm font-semibold mb-2 text-gray-300">
              Adicionar Música (Opcional)
            </label>
            <input
              id="story-audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-700 file:text-white
                hover:file:bg-gray-600 cursor-pointer"
              aria-label="Selecionar arquivo de áudio para o story"
            />
            {audioPreviewUrl && (
              <div className="mt-4 flex flex-col items-center">
                <audio ref={audioRef} src={audioPreviewUrl} controls className="w-full"></audio>
                <span className="text-xs text-gray-400 mt-2">Áudio selecionado</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handlePublish}
            disabled={!imageFile || isUploading}
            loading={isUploading}
          >
            Publicar Story
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryUploadModal;