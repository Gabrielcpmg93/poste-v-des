import React, { useState, useEffect, useCallback } from 'react';
import { Profile as ProfileType, Video } from '../types';
import { loadProfileData, saveProfileData, loadLikedVideoIds } from '../utils/localStorage';
import Button from '../components/Button';

interface ProfileProps {
  videos: Video[];
}

const Profile: React.FC<ProfileProps> = ({ videos }) => {
  const [profile, setProfile] = useState<ProfileType>(loadProfileData());
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedProfilePicture, setEditedProfilePicture] = useState<string | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);

  // New state for active tab
  const [activeTab, setActiveTab] = useState<'myVideos' | 'likedVideos' | 'about'>('myVideos');

  // Load profile data and initialize edited fields
  useEffect(() => {
    const storedProfile = loadProfileData();
    setProfile(storedProfile);
    setEditedUsername(storedProfile.username);
    setEditedBio(storedProfile.bio);
    setEditedProfilePicture(storedProfile.profilePicture);
  }, []);

  // Filter videos and calculate stats whenever `videos` or `profile.username` changes
  useEffect(() => {
    // Filter user's own videos
    const filteredUserVideos = videos.filter(video => video.artist === profile.username);
    setUserVideos(filteredUserVideos);

    // Filter liked videos
    const likedVideoIds = loadLikedVideoIds();
    const filteredLikedVideos = videos.filter(video => likedVideoIds.has(video.id));
    setLikedVideos(filteredLikedVideos);

    // No longer calculating totalLikesReceived for main display as per image
  }, [videos, profile.username]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset edited fields to current profile values
    setEditedUsername(profile.username);
    setEditedBio(profile.bio);
    setEditedProfilePicture(profile.profilePicture);
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = useCallback(() => {
    const updatedProfile: ProfileType = {
      ...profile,
      username: editedUsername.trim() || 'QuickVidUser',
      bio: editedBio.trim(),
      profilePicture: editedProfilePicture || 'https://via.placeholder.com/150/000000/FFFFFF?text=QV',
    };
    saveProfileData(updatedProfile);
    setProfile(updatedProfile); // Update local state immediately
    setIsEditing(false);
  }, [profile, editedUsername, editedBio, editedProfilePicture]);

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'myVideos':
        return userVideos.length === 0 ? (
          <p className="text-gray-400 text-center py-8">You haven't posted any videos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1"> {/* Smaller gap for tighter grid */}
            {userVideos.map((video) => (
              <div key={video.id} className="relative w-full aspect-[9/16] bg-gray-800 overflow-hidden cursor-pointer group">
                <img
                  src={video.thumbnail}
                  alt={video.caption || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        );
      case 'likedVideos':
        return likedVideos.length === 0 ? (
          <p className="text-gray-400 text-center py-8">You haven't liked any videos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1"> {/* Smaller gap for tighter grid */}
            {likedVideos.map((video) => (
              <div key={video.id} className="relative w-full aspect-[9/16] bg-gray-800 overflow-hidden cursor-pointer group">
                <img
                  src={video.thumbnail}
                  alt={video.caption || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        );
      case 'about':
        return (
          <div className="py-8 text-center text-gray-300">
            <p className="text-lg font-semibold mb-2">Sobre @{profile.username}</p>
            <p className="italic">{profile.bio || 'Este usuário ainda não adicionou uma biografia.'}</p>
            {/* Could add more info here later */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-full p-0 bg-black text-white overflow-y-auto"> {/* Removed padding here to allow tabs to go full width */}
      {/* Profile Header - always visible */}
      <div className="w-full max-w-md bg-black pt-6 pb-4 px-4 text-center"> {/* Added horizontal padding */}
        <img
          src={profile.profilePicture}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-red-500 mb-2" // Slightly larger profile pic
        />
        <h3 className="text-xl font-bold mt-2">@{profile.username}</h3>
        <p className="text-gray-300 text-sm italic mb-4">{profile.bio || 'Sem biografia ainda.'}</p>
        <Button variant="secondary" onClick={handleEditClick} className="w-3/4 mx-auto mb-6"> {/* Centered and wider */}
          Editar Perfil
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="w-full flex justify-around border-b border-gray-700 bg-gray-900 sticky top-0 z-10"> {/* Sticky for better UX */}
        {/* My Videos Tab */}
        <button
          className={`flex-1 flex flex-col items-center py-3 text-gray-400 relative transition-colors duration-200 
            ${activeTab === 'myVideos' ? 'text-green-500' : 'hover:text-gray-200'}`}
          onClick={() => setActiveTab('myVideos')}
          aria-label="Ver meus vídeos postados"
        >
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm-11 11h7v7H3v-7zm11 0h7v7h-7v-7z" />
          </svg>
          <span className="text-sm font-semibold">{userVideos.length}</span>
          {activeTab === 'myVideos' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>}
        </button>

        {/* Liked Videos Tab */}
        <button
          className={`flex-1 flex flex-col items-center py-3 text-gray-400 relative transition-colors duration-200 
            ${activeTab === 'likedVideos' ? 'text-green-500' : 'hover:text-gray-200'}`}
          onClick={() => setActiveTab('likedVideos')}
          aria-label="Ver vídeos que você curtiu"
        >
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/> {/* Film reel / video icon */}
          </svg>
          <span className="text-sm font-semibold">{likedVideos.length}</span>
          {activeTab === 'likedVideos' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>}
        </button>

        {/* About/Info Tab */}
        <button
          className={`flex-1 flex flex-col items-center py-3 text-gray-400 relative transition-colors duration-200 
            ${activeTab === 'about' ? 'text-green-500' : 'hover:text-gray-200'}`}
          onClick={() => setActiveTab('about')}
          aria-label="Ver informações sobre o perfil"
        >
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          {/* No count for info tab as per image */}
          {activeTab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>}
        </button>
      </div>

      {/* Content Area - videos or about info */}
      <div className="w-full max-w-md bg-black pb-20"> {/* Added pb-20 for space above navigation bar */}
        {isEditing ? (
          // Editing UI takes precedence
          <div className="space-y-6 p-4"> {/* Added padding */}
            <div className="flex flex-col items-center">
              <img
                src={editedProfilePicture || 'https://via.placeholder.com/150/000000/FFFFFF?text=QV'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-red-500 mb-4"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-500 file:text-white
                  hover:file:bg-red-600 cursor-pointer"
                aria-label="Upload nova foto de perfil"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-semibold mb-2">
                Nome de Usuário
              </label>
              <input
                id="username"
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                placeholder="Insira seu nome de usuário"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
                aria-label="Campo para nome de usuário"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold mb-2">
                Biografia
              </label>
              <textarea
                id="bio"
                rows={4}
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Conte-nos sobre você!"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
                aria-label="Campo para biografia"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="secondary" onClick={handleCancelClick}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveClick}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default Profile;