

import { Video, Comment, Profile } from '../types';
import { VIDEOS_KEY, LIKED_VIDEOS_KEY, PROFILE_KEY } from '../constants';
import { v4 as uuidv4 } from 'uuid';

/**
 * Loads videos from local storage.
 * @returns An array of Video objects or null if no videos are found.
 */
export function loadVideos(): Video[] {
  try {
    const jsonString = localStorage.getItem(VIDEOS_KEY);
    if (jsonString) {
      const storedVideos: Video[] = JSON.parse(jsonString);
      // Re-create Blob URLs for videos if they were stored as files
      return storedVideos.map(video => {
        // NOTE: URL.createObjectURL is transient. For a truly persistent demo
        // with video files, IndexedDB or server upload would be needed.
        // For now, we rely on the URL being valid during a session or if the file reference is somehow re-established.
        // The `file` property is not stored in localStorage, so this check `video.file instanceof File` will always be false after page refresh.
        // Instead, if the original 'src' was a blob URL, it would be invalid.
        // For this demo, we assume `src` is stable or will be re-generated on upload.
        return video;
      });
    }
  } catch (error) {
    console.error('Error loading videos from local storage:', error);
  }
  return [];
}

/**
 * Saves a new video to local storage by prepending it to the list.
 * @param newVideo The video to save.
 * @returns The updated array of videos.
 */
export function addVideo(newVideo: Video): Video[] {
  try {
    const existingVideos = loadVideos();
    const updatedVideos = [newVideo, ...existingVideos];
    
    const videosToStore = updatedVideos.map(video => {
      const { file, ...rest } = video; // Exclude 'file' property from storage
      return rest;
    });

    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videosToStore));
    return updatedVideos;
  } catch (error) {
    console.error('Error adding video to local storage:', error);
    return loadVideos();
  }
}

/**
 * Updates an existing video in local storage.
 * @param updatedVideo The video to update.
 * @returns The updated array of videos.
 */
export function updateVideo(updatedVideo: Video): Video[] {
  try {
    const existingVideos = loadVideos();
    const videoIndex = existingVideos.findIndex(video => video.id === updatedVideo.id);

    if (videoIndex > -1) {
      existingVideos[videoIndex] = updatedVideo;
    } else {
      console.warn(`Video with ID ${updatedVideo.id} not found for update. Adding as new.`);
      existingVideos.unshift(updatedVideo); // Add if not found
    }

    const videosToStore = existingVideos.map(video => {
      const { file, ...rest } = video; // Exclude 'file' property from storage
      return rest;
    });

    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videosToStore));
    return existingVideos;
  } catch (error) {
    console.error('Error updating video in local storage:', error);
    return loadVideos();
  }
}


/**
 * Loads a set of liked video IDs from local storage.
 * @returns A Set of video IDs that have been liked by the user.
 */
export function loadLikedVideoIds(): Set<string> {
  try {
    const jsonString = localStorage.getItem(LIKED_VIDEOS_KEY);
    if (jsonString) {
      return new Set<string>(JSON.parse(jsonString));
    }
  } catch (error) {
    console.error('Error loading liked video IDs from local storage:', error);
  }
  return new Set<string>();
}

/**
 * Saves a set of liked video IDs to local storage.
 * @param likedIds The Set of video IDs to save.
 */
export function saveLikedVideoIds(likedIds: Set<string>): void {
  try {
    localStorage.setItem(LIKED_VIDEOS_KEY, JSON.stringify(Array.from(likedIds)));
  } catch (error) {
    console.error('Error saving liked video IDs to local storage:', error);
  }
}

/**
 * Loads the user profile data from local storage, or returns a default profile.
 * @returns The user's Profile object.
 */
export function loadProfileData(): Profile {
  try {
    const jsonString = localStorage.getItem(PROFILE_KEY);
    if (jsonString) {
      const storedProfile: Profile = JSON.parse(jsonString);
      // Ensure displayId, followersCount, and isFollowing exist; generate if missing for existing profiles
      if (!storedProfile.displayId) {
        storedProfile.displayId = Math.floor(1000000 + Math.random() * 9000000).toString(); // 7-digit random number
      }
      if (typeof storedProfile.followersCount !== 'number') {
        storedProfile.followersCount = 0;
      }
      if (typeof storedProfile.isFollowing !== 'boolean') {
        storedProfile.isFollowing = false;
      }
      // Save updated profile if any new fields were added
      saveProfileData(storedProfile);
      return storedProfile;
    }
  } catch (error) {
    console.error('Error loading profile data from local storage:', error);
  }
  // Default profile if none is found or an error occurs
  return {
    id: uuidv4(),
    username: 'QuickVidUser',
    bio: 'Welcome to my QuickVid profile!',
    profilePicture: 'https://via.placeholder.com/150/000000/FFFFFF?text=QV', // Default placeholder image
    displayId: Math.floor(1000000 + Math.random() * 9000000).toString(), // Generate a new 7-digit ID
    followersCount: 0,
    isFollowing: false,
  };
}

/**
 * Saves the user profile data to local storage.
 * @param profile The Profile object to save.
 */
export function saveProfileData(profile: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving profile data to local storage:', error);
  }
}