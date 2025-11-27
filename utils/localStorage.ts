
import { Video, Comment, Profile } from '../types';
import { VIDEOS_KEY, LIKED_VIDEOS_KEY, PROFILE_KEY } from '../constants';
import { v4 as uuidv4 } from 'uuid';

/**
 * Determines if a video should be included based on defined exclusion criteria.
 * @param video The video to check.
 * @returns True if the video should be included, false otherwise.
 */
function shouldIncludeVideo(video: Video): boolean {
  return (
    video.description !== 'teste' &&
    video.description !== 'vídeo' &&
    video.artist.toLowerCase() !== 'você'
  );
}

/**
 * Loads videos from local storage.
 * @returns An array of Video objects or null if no videos are found.
 */
export function loadVideos(): Video[] {
  try {
    const jsonString = localStorage.getItem(VIDEOS_KEY);
    if (jsonString) {
      let storedVideos: Video[] = JSON.parse(jsonString);
      // Filter out videos with specific descriptions as requested
      // and filter out videos where the artist is 'Você'
      storedVideos = storedVideos.filter(shouldIncludeVideo);
      
      // Re-create Blob URLs for videos if they were stored as files
      return storedVideos.map(video => {
        // NOTE: URL.createObjectURL is transient. For a truly persistent demo
        // with video files, IndexedDB or server upload would be needed.
        // For now, we assume `src` is stable or will be re-generated on upload.
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
 * Videos that match exclusion criteria will not be added.
 * @param newVideo The video to save.
 * @returns The updated array of videos that meet the inclusion criteria.
 */
export function addVideo(newVideo: Video): Video[] {
  try {
    // Check if the new video meets the inclusion criteria before adding
    if (!shouldIncludeVideo(newVideo)) {
      console.warn('Video not added due to exclusion criteria:', newVideo);
      return loadVideos(); // Return the current filtered list without the new video
    }

    const existingVideos = loadVideos(); // This already loads filtered videos
    const updatedVideos = [newVideo, ...existingVideos]; // newVideo has passed the filter
    
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
 * If the updated video matches exclusion criteria, it will be removed.
 * @param updatedVideo The video to update.
 * @returns The updated array of videos that meet the inclusion criteria.
 */
export function updateVideo(updatedVideo: Video): Video[] {
  try {
    const existingVideos = loadVideos(); // This already loads filtered videos
    let newVideosList: Video[];

    if (shouldIncludeVideo(updatedVideo)) {
      // If the updated video still meets criteria, find and replace or add if not found
      const videoIndex = existingVideos.findIndex(video => video.id === updatedVideo.id);
      if (videoIndex > -1) {
        newVideosList = existingVideos.map(video =>
          video.id === updatedVideo.id ? updatedVideo : video
        );
      } else {
        // If not found, add it as new (unlikely for an "update" but handles edge cases)
        console.warn(`Video with ID ${updatedVideo.id} not found for update, but passes filter. Adding as new.`);
        newVideosList = [updatedVideo, ...existingVideos];
      }
    } else {
      // If the updated video now fails criteria, filter it out from the list
      console.warn('Video removed from storage due to updated exclusion criteria:', updatedVideo);
      newVideosList = existingVideos.filter(video => video.id !== updatedVideo.id);
    }

    const videosToStore = newVideosList.map(video => {
      const { file, ...rest } = video; // Exclude 'file' property from storage
      return rest;
    });

    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videosToStore));
    return newVideosList;
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
