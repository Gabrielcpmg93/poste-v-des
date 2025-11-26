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
  const [totalLikesReceived, setTotalLikesReceived] = useState(0);

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

    // Calculate total likes received by the user's videos
    const likesSum = filteredUserVideos.reduce((sum, video) => sum + video.likesCount, 0);
    setTotalLikesReceived(likesSum);

    // Filter liked videos
    const likedVideoIds = loadLikedVideoIds();
    const filteredLikedVideos = videos.filter(video => likedVideoIds.has(video.id));
    setLikedVideos(filteredLikedVideos);
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

  return (
    <div className="flex flex-col items-center justify-start h-full p-6 md:p-8 bg-black text-white overflow-y-auto">
      <h2 className="text-3xl font-bold mb-8 mt-4">Profile</h2>

      <div className="bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md">
        {isEditing ? (
          <div className="space-y-6">
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
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-semibold mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Tell us about yourself!"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="secondary" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveClick}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <img
              src={profile.profilePicture}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover mx-auto border-4 border-red-500"
            />
            <h3 className="text-2xl font-bold mt-4">@{profile.username}</h3>
            <p className="text-gray-300 italic">{profile.bio || 'No bio yet.'}</p>

            {/* Profile Statistics */}
            <div className="flex justify-center space-x-8 mt-6 mb-6">
              <div>
                <p className="text-xl font-bold">{userVideos.length}</p>
                <p className="text-gray-400 text-sm">Videos</p>
              </div>
              <div>
                <p className="text-xl font-bold">{totalLikesReceived}</p>
                <p className="text-gray-400 text-sm">Likes</p>
              </div>
            </div>

            <Button variant="primary" onClick={handleEditClick} className="mt-4">
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* My Videos Section */}
      <div className="w-full max-w-md mt-8">
        <h3 className="text-xl font-bold mb-4">My Videos ({userVideos.length})</h3>
        {userVideos.length === 0 ? (
          <p className="text-gray-400 text-center">You haven't posted any videos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {userVideos.map((video) => (
              <div key={video.id} className="relative w-full aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden cursor-pointer group">
                <img
                  src={video.thumbnail}
                  alt={video.caption || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liked Videos Section */}
      <div className="w-full max-w-md mt-8 pb-20"> {/* Added pb-20 for space above navigation bar */}
        <h3 className="text-xl font-bold mb-4">Liked Videos ({likedVideos.length})</h3>
        {likedVideos.length === 0 ? (
          <p className="text-gray-400 text-center">You haven't liked any videos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {likedVideos.map((video) => (
              <div key={video.id} className="relative w-full aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden cursor-pointer group">
                <img
                  src={video.thumbnail}
                  alt={video.caption || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;