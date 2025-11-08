import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData =
      error.response?.data ??
      (error.request
        ? "No response received from the server (Network or CORS error)"
        : error.message);

    console.error("🌐 API Error:", errorData);

    return Promise.reject(error);
  }
);