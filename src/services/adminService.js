// src/services/adminService.js
import axiosInstance from './axiosInstance';

const API_ENDPOINT = '/admin';

/**
 * Get All Users (Admin)
 * @param {object} params - Query parameters
 * @param {string} [params.role] - Filter by role (jobseeker, recruiter, admin)
 * @param {string} [params.search] - Search by name/email
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Page size
 * @param {string} [params.sortBy] - Field to sort by (e.g., createdAt)
 * @param {string} [params.order] - Sort direction (asc, desc)
 * @returns {Promise<object>} API response
 */
export const getAllUsers = async (params) => {
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}/users`, { params });
    return response.data; // { status: "success", data: { results, totalResults, ... users: [] } }
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Failed to get users" };
  }
};

/**
 * Get User by ID (Admin)
 * @param {string} userId - The ID of the user to retrieve
 * @returns {Promise<object>} API response
 */
export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}/users/${userId}`);
    return response.data; // { status: "success", data: { user: { ... } } }
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Failed to get user details" };
  }
};

/**
 * Update User by ID (Admin)
 * @param {string} userId - The ID of the user to update
 * @param {object} userData - User data to update
 * @param {string} [userData.name]
 * @param {string} [userData.email]
 * @param {string} [userData.role]
 * @param {string} [userData.companyName] - Required if role is recruiter
 * @param {boolean} [userData.isActive]
 * @returns {Promise<object>} API response
 */
export const updateUserById = async (userId, userData) => {
  try {
    const response = await axiosInstance.patch(`${API_ENDPOINT}/users/${userId}`, userData);
    return response.data; // { status: "success", data: { user: { ... } } }
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Failed to update user" };
  }
};

/**
 * Delete User by ID (Admin)
 * @param {string} userId - The ID of the user to delete
 * @returns {Promise<object>} API response
 */
export const deleteUserById = async (userId) => {
  try {
    const response = await axiosInstance.delete(`${API_ENDPOINT}/users/${userId}`);
    return response.data; // { status: "success", data: null }
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Failed to delete user" };
  }
};

/**
 * Get User Statistics (Admin)
 * @returns {Promise<object>} API response
 */
export const getUserStats = async () => {
  try {
    const response = await axiosInstance.get(`${API_ENDPOINT}/users/stats`);
    return response.data; // { status: "success", data: { totalUsers, usersByRole, recentRegistrations } }
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Failed to get user statistics" };
  }
};