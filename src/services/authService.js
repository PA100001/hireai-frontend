import axiosInstance from './axiosInstance';

const API_ENDPOINT = '/auth';

export const registerUser = async (userData) => {
  // The backend expects role as string, e.g., "jobseeker" or "recruiter"
  // User model has role as enum [1, 2, 3] which is likely a backend internal detail
  // The API doc says: "role": "jobseeker"
  // Ensure userData.role is one of these string values before sending.
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}/register`, userData);
    return response.data; // { status: "success", token: "...", data: { user: { ... } } }
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Registration failed" };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}/login`, credentials);
    return response.data; // { status: "success", data: { token: "...", user: { ... } } }
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Login failed" };
  }
};