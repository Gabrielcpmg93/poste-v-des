
import { Video } from '../types';
import { VIDEOS_KEY } from '../constants';

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
        if (video.file instanceof File) {
          return { ...video, src: URL.createObjectURL(video.file) };
        }
        return video;
      });
    }
  } catch (error) {
    console.error('Error loading videos from local storage:', error);
  }
  return [];
}

/**
 * Saves a new video to local storage.
 * @param newVideo The video to save.
 * @returns The updated array of videos.
 */
export function saveVideos(newVideo: Video): Video[] {
  try {
    const existingVideos = loadVideos();
    // Prepend the new video to the list
    const updatedVideos = [newVideo, ...existingVideos];
    
    // For local storage, we can't directly store File objects.
    // If we want persistent file data, we'd need to convert to base64 or upload to a server.
    // For this demo, we'll store the URL and assume the user won't clear local storage.
    // However, if the page is refreshed, URL.createObjectURLs will be invalid.
    // A more robust solution for local persistence of video files would be IndexedDB.
    // For now, we'll remove the 'file' property to ensure JSON.stringify works.
    const videosToStore = updatedVideos.map(video => {
      const { file, ...rest } = video; // Destructure to exclude 'file'
      return rest;
    });

    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videosToStore));
    return updatedVideos;
  } catch (error) {
    console.error('Error saving video to local storage:', error);
    return loadVideos(); // Return current state if save fails
  }
}
