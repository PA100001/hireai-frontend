// src/services/recruiterService.js
import axiosInstance from './axiosInstance';

const API_ENDPOINT = '/recruiters';

/**
 * Search Job Seekers (Recruiter/Admin)
 * @param {object} queryData
 * @param {string} queryData.userQuery - The natural language query
 * @returns {Promise<object>} API response
 */
export const searchSeekers = async (queryData) => {
  try {
    const response = await axiosInstance.post(`${API_ENDPOINT}/seekers`, queryData);
    return response.data; // { status: "success", data: [ { seeker_profile_1 }, ... ] }
  } catch (error) {
    throw error.response?.data || { status: "fail", message: "Failed to search seekers" };
  }
};