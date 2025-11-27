
import React, { useState, useEffect, useCallback } from 'react';
import { Profile as ProfileType, Video } from '../types';
import { loadProfileData, saveProfileData, loadLikedVideoIds } from '../utils/localStorage';
import Button from '../components/Button';
import { v4 as uuidv4 } from 'uuid';

interface ProfileProps {
  videos: Video[];
  viewingUsername: string | null; // New prop: username of the profile to view
}

const Profile: React.FC<ProfileProps> = ({ videos, viewingUsername }) => {
  // Always load the logged-in user's profile
  const [loggedInUserProfile, setLoggedInUserProfile] = useState<ProfileType>(loadProfileData);

  // State for the profile currently being displayed (could be logged-in user or another user)
  const [currentProfile, setCurrentProfile] = useState<ProfileType>(loggedInUserProfile);
  const [isViewingSelf, setIsViewingSelf] = useState(true);

  // States for editing current user's profile
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedProfilePicture, setEditedProfilePicture] = useState<string | null>(null);

  // States for local follow behavior on *other* profiles (non-persistent)
  const [otherProfileFollowersCount, setOtherProfileFollowersCount] = useState(0);
  const [isFollowingOtherProfile, setIsFollowingOtherProfile] = useState(false);

  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<'myVideos' | 'likedVideos' | 'about' | 'monetization'>('myVideos');

  // Effect to determine which profile to display and initialize states
  useEffect(() => {
    const freshLoggedInProfile = loadProfileData(); // Reload to ensure it's fresh
    setLoggedInUserProfile(freshLoggedInProfile);

    const isSelf = !viewingUsername || viewingUsername === freshLoggedInProfile.username;
    setIsViewingSelf(isSelf);

    if (isSelf) {
      setCurrentProfile(freshLoggedInProfile);
      setEditedUsername(freshLoggedInProfile.username);
      setEditedBio(freshLoggedInProfile.bio);
      setEditedProfilePicture(freshLoggedInProfile.profilePicture);
      setIsEditing(false); // Ensure not in editing mode when viewing self initially
    } else {
      // Simulate another user's profile
      setCurrentProfile({
        id: uuidv4(), // Generate a new ID for the simulated profile
        username: viewingUsername,
        bio: `Olá! Eu sou ${viewingUsername} no QuickVid.`, // Generic bio
        profilePicture: 'https://via.placeholder.com/150/000000/FFFFFF?text=QV', // Default placeholder image
        displayId: Math.floor(1000000 + Math.random() * 9000000).toString(), // New 7-digit ID
        followersCount: 0, // Start with 0 followers
        isFollowing: false, // Start as not following
      });
      setIsEditing(false); // Cannot edit another user's profile
      // Reset local follow states for a new 'other' profile view
      setOtherProfileFollowersCount(0);
      setIsFollowingOtherProfile(false);
    }
  }, [viewingUsername]); // Re-run when viewingUsername changes

  // Filter videos and calculate stats whenever `videos` or `currentProfile.username` changes
  useEffect(() => {
    // Filter user's own videos (based on the profile currently being viewed)
    const filteredUserVideos = videos.filter(video => video.artist === currentProfile.username);
    setUserVideos(filteredUserVideos);

    // Filter liked videos (only applicable to the logged-in user's profile)
    // When viewing another profile, 'likedVideos' tab will show an empty state or generic message.
    if (isViewingSelf) {
      const likedVideoIds = loadLikedVideoIds();
      const filteredLikedVideos = videos.filter(video => likedVideoIds.has(video.id));
      setLikedVideos(filteredLikedVideos);
    } else {
      setLikedVideos([]); // Clear liked videos when viewing another profile
    }
  }, [videos, currentProfile.username, isViewingSelf]);

  // Determine if the current profile is verified (30+ videos)
  const isVerified = userVideos.length >= 30;

  const handleEditClick = () => {
    if (isViewingSelf) {
      setIsEditing(true);
    }
  };

  const handleCancelClick = () => {
    if (isViewingSelf) {
      setIsEditing(false);
      // Reset edited fields to current profile values
      setEditedUsername(loggedInUserProfile.username);
      setEditedBio(loggedInUserProfile.bio);
      setEditedProfilePicture(loggedInUserProfile.profilePicture);
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewingSelf) {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditedProfilePicture(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveClick = useCallback(() => {
    if (isViewingSelf) {
      const updatedProfile: ProfileType = {
        ...loggedInUserProfile,
        username: editedUsername.trim() || 'QuickVidUser',
        bio: editedBio.trim(),
        profilePicture: editedProfilePicture || 'https://via.placeholder.com/150/000000/FFFFFF?text=QV',
      };
      saveProfileData(updatedProfile);
      setLoggedInUserProfile(updatedProfile); // Update logged-in user's state
      setCurrentProfile(updatedProfile); // Also update currentProfile if viewing self
      setIsEditing(false);
    }
  }, [isViewingSelf, loggedInUserProfile, editedUsername, editedBio, editedProfilePicture]);

  const handleFollowClick = useCallback(() => {
    if (!isViewingSelf) {
      // Logic for following another profile (local state only for now)
      if (!isFollowingOtherProfile) {
        setOtherProfileFollowersCount(prev => prev + 1);
        setIsFollowingOtherProfile(true);
      }
    }
    // No "follow" button for self, so no action needed for isViewingSelf
  }, [isViewingSelf, isFollowingOtherProfile]);


  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'myVideos':
        return userVideos.length === 0 ? (
          <p className="text-gray-400 text-center py-8">{isViewingSelf ? 'Você' : currentProfile.username} ainda não publicou nenhum vídeo.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
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
        if (!isViewingSelf) {
          return (
            <p className="text-gray-400 text-center py-8">Não é possível ver os vídeos curtidos de outros usuários.</p>
          );
        }
        return likedVideos.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Você ainda não curtiu nenhum vídeo.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
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
            <p className="text-lg font-semibold mb-2">Sobre @{currentProfile.username}</p>
            <p className="italic">{currentProfile.bio || 'Este usuário ainda não adicionou uma biografia.'}</p>
          </div>
        );
      case 'monetization': // New monetization tab content
        if (!isViewingSelf) {
          return (
            <p className="text-gray-400 text-center py-8">Não é possível ver as informações de monetização de outros usuários.</p>
          );
        }
        return (
          <div className="py-8 text-center text-gray-300">
            <p className="text-lg font-semibold mb-2">Monetização</p>
            <p className="italic">Informações sobre monetização serão exibidas aqui.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-full p-0 bg-black text-white overflow-y-auto">
      {/* Profile Header - always visible */}
      <div className="w-full max-w-md bg-black pt-6 pb-4 px-4 text-center">
        <div className="relative w-32 h-32 mx-auto mb-2 group">
          <img
            src={currentProfile.profilePicture}
            alt="Profile"
            className={`w-full h-full rounded-full object-cover mx-auto border-4 border-red-500`}
          />
        </div>
        <h3 className="text-xl font-bold mt-2 flex items-center justify-center">
          @{currentProfile.username}
          {isVerified && (
            <svg
              className="ml-2 w-5 h-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Conta verificada"
              title="Conta verificada"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          )}
        </h3>
        <p className="text-gray-400 text-sm mt-1">ID: {currentProfile.displayId}</p>
        <p className="text-gray-400 text-sm mb-2">
          {isViewingSelf ? loggedInUserProfile.followersCount : otherProfileFollowersCount} Seguidores
        </p>
        <p className="text-gray-300 text-sm italic mb-4">{currentProfile.bio || 'Sem biografia ainda.'}</p>
        <div className="flex justify-center space-x-2 mb-6">
          {isViewingSelf ? (
            <Button variant="secondary" size="sm" onClick={handleEditClick}>
              Editar Perfil
            </Button>
          ) : (
            <Button
              variant={isFollowingOtherProfile ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleFollowClick}
              disabled={isFollowingOtherProfile}
            >
              {isFollowingOtherProfile ? 'Seguindo' : 'Seguir'}
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full flex justify-around border-b border-gray-700 bg-gray-900 sticky top-0 z-10">
        <button
          className={`flex-1 flex flex-col items-center py-2 text-gray-400 relative transition-colors duration-200 
            ${activeTab === 'myVideos' ? 'text-green-500' : 'hover:text-gray-200'}`}
          onClick={() => setActiveTab('myVideos')}
          aria-label={`Ver vídeos postados por ${currentProfile.username}`}
        >
          <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm-11 11h7v7H3v-7zm11 0h7v7h-7v-7z" />
          </svg>
          <span className="text-xs font-semibold">{userVideos.length}</span>
          {activeTab === 'myVideos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>}
        </button>

        <button
          className={`flex-1 flex flex-col items-center py-2 text-gray-400 relative transition-colors duration-200 
            ${activeTab === 'likedVideos' ? 'text-green-500' : 'hover:text-gray-200'}`}
          onClick={() => setActiveTab('likedVideos')}
          aria-label={isViewingSelf ? "Ver vídeos que você curtiu" : "Ver vídeos que este usuário curtiu (não disponível)"}
        >
          <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
          <span className="text-xs font-semibold">{isViewingSelf ? likedVideos.length : '-'}</span>
          {activeTab === 'likedVideos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>}
        </button>

        <button
          className={`flex-1 flex flex-col items-center py-2 text-gray-400 relative transition-colors duration-200 
            ${activeTab === 'about' ? 'text-green-500' : 'hover:text-gray-200'}`}
          onClick={() => setActiveTab('about')}
          aria-label={`Ver informações sobre ${currentProfile.username}`}
        >
          <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <span className="text-xs font-semibold">Info</span>
          {activeTab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>}
        </button>

        <button
          className={`flex-1 flex flex-col items-center py-2 text-gray-400 relative transition-colors duration-200 
            ${activeTab === 'monetization' ? 'text-green-500' : 'hover:text-gray-200'}`}
          onClick={() => setActiveTab('monetization')}
          aria-label={isViewingSelf ? "Ver informações sobre monetização" : "Ver informações de monetização de outros usuários (não disponível)"}
        >
          <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-4H9V8h4c1.1 0 2 .9 2 2v1.5c0 .83-.67 1.5-1.5 1.5h-.5v1.5h2v2zm0-5.5h-2V10h2v.5z"/>
          </svg>
          <span className="text-xs font-semibold">Ganhos</span>
          {activeTab === 'monetization' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>}
        </button>
      </div>

      {/* Content Area - videos or about info */}
      <div className="w-full max-w-md bg-black pb-20">
        {isEditing && isViewingSelf ? ( // Only allow editing if viewing self AND is in editing mode
          <div className="space-y-6 p-4">
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