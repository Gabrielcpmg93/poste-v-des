
import React, { useState, useEffect, useCallback } from 'react';
import { Profile as ProfileType } from '../types';
import { loadProfileData, saveProfileData } from '../utils/localStorage';
import Button from '../components/Button'; // Assuming you have a Button component

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileType>(loadProfileData());
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedProfilePicture, setEditedProfilePicture] = useState<string | null>(null); // Base64 string

  useEffect(() => {
    // Load profile data when the component mounts or after saving
    const storedProfile = loadProfileData();
    setProfile(storedProfile);
    setEditedUsername(storedProfile.username);
    setEditedBio(storedProfile.bio);
    setEditedProfilePicture(storedProfile.profilePicture);
  }, []);

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
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-red-500"
            />
            <h3 className="text-2xl font-bold mt-4">@{profile.username}</h3>
            <p className="text-gray-300 italic">{profile.bio || 'No bio yet.'}</p>
            <Button variant="primary" onClick={handleEditClick} className="mt-6">
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;