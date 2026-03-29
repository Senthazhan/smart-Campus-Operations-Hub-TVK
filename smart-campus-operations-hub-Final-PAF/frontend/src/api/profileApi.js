import { http as api } from './http';

const extractError = (error) => {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    'Unexpected error'
  );
};

export const getMyProfile = async () => {
  try {
    const response = await api.get('/profile/me');
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.post('/profile/update', data);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

export const changePassword = async (data) => {
  try {
    const response = await api.post('/profile/change-password', data);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

export const updateAvatar = async (formData) => {
  try {
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};

/**
 * Generates the avatar URL with cache-busting versioning.
 * - Absolute URLs (http/https) are used as-is (e.g., Google OAuth profile photos).
 * - Relative paths (e.g., /api/v1/files/avatars/...) are kept relative so they
 *   route through the Vite dev proxy to the backend.
 */
export const getAvatarUrl = (avatarUrl, version = null) => {
  if (!avatarUrl) return null;

  const v = version || Date.now();
  
  // If it's an absolute URL (Google, external CDN, etc.), use it directly
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${v}`;
  }

  // Otherwise it's a relative backend path like /api/v1/files/avatars/userId/avatar.jpg
  // Keep it relative so Vite proxy forwards it to the backend on port 8080
  return `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${v}`;
};