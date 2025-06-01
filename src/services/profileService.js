// src/services/profileService.js
import axiosInstance from './axiosInstance';

const API_ENDPOINT = '/profile';

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINT);
    return response.data;
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Failed to get user profile" };
  }
};
export const getUserProfileById = async (userId) => {
  try {
    // The endpoint might be /users/:userId/profile or /profiles/:userId etc.
    // Adjust to your actual API endpoint.
    const response = await axiosInstance.get(`/admin/users/${userId}`); // Or a more specific public profile endpoint
    return response.data; // Assuming API returns { success: true, data: { user: {...} } }
  } catch (error) {
    console.error('Error fetching user profile by ID:', error.response || error);
    throw error.response?.data || error;
  }
};
export const updateProfile = async (profileData) => {
  // profileData contains:
  // {
  //   name: "...", (optional)
  //   email: "...", (optional)
  //   password: "...", (optional, if API supports it here)
  //   profileUpdates: { ... } (role-specific, optional)
  // }

  const formData = new FormData();

  if (profileData.name) {
    formData.append('name', profileData.name);
  }
  if (profileData.email) {
    formData.append('email', profileData.email);
  }
  if (profileData.password && profileData.password.length > 0) { // Only send if password is provided
    formData.append('password', profileData.password);
  }

  // If profileUpdates exists and has keys, stringify and append it.
  // The backend expects Content-Type: multipart/form-data, and the example for jobSeeker
  // shows profileUpdates as an object. The user clarification indicates it should be stringified.
  if (profileData.profileUpdates && Object.keys(profileData.profileUpdates).length > 0) {
    formData.append('profileUpdates', JSON.stringify(profileData.profileUpdates));
  }

  try {
    const response = await axiosInstance.patch(API_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Axios might set this automatically with FormData, but explicit is fine.
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error.response?.data || error.message);
    throw error.response?.data || { status: "fail", message: "Failed to update profile" };
  }
};

export const uploadResume = async (resumeFile) => {
  const formData = new FormData();
  formData.append('resume', resumeFile); // Field name is 'resume'
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}/resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Failed to upload resume" };
  }
};

export const downloadResume = async (userId = null, download = true) => {
  const url = userId ? `${API_ENDPOINT}/resume/${userId}` : `${API_ENDPOINT}/resume`;
  try {
    const response = await axiosInstance.get(url, {
      params: { download },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'resume'; // Default
    if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
    }
    if (!fileName.match(/\.(pdf|doc|docx)$/i)) { // Ensure a reasonable extension
        const type = response.headers['content-type'];
        if (type === 'application/pdf') fileName += '.pdf';
        else if (type === 'application/msword') fileName += '.doc';
        else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') fileName += '.docx';
    }
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
    return { status: "success", message: "Resume downloaded" };
  } catch (error) {
    console.error('Download error:', error);
    throw error.response?.data || { status: "fail", message: "Failed to download resume" };
  }
};

export const uploadProfilePicture = async (profilePictureFile) => {
  const formData = new FormData();
  formData.append('profilePicture', profilePictureFile); // Field name is 'profilePicture'
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Failed to upload profile picture" };
  }
};

export const deleteMyAccount = async () => {
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}/delete`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Failed to delete account" };
  }
};