import { Platform } from "react-native";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use environment variable if available (for Docker container)
let url: string;

// Check for environment variable (Expo uses EXPO_PUBLIC_ prefix)
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (envApiUrl) {
  // Use the environment variable if available (Docker container)
  url = envApiUrl;
} else if (Platform.OS === "android") {
  url = "http://10.0.2.2:8081";
} else if (Platform.OS === "web") {
  // For web, use the same hostname but different port
  // Check if window is defined (client-side) to avoid SSR issues
  if (typeof window !== 'undefined') {
    url = `${window.location.protocol}//${window.location.hostname}:8081`;
  } else {
    // Fallback for server-side rendering
    url = "http://127.0.0.1:8081";
  }
} else {
  // iOS and other platforms
  url = "http://127.0.0.1:8081";
}
// For physical device testing, uncomment and update the following line:
// const url = "https://your-ngrok-url.ngrok-free.app"

// Remove "/api" suffix if it's already included in the environment variable
const baseURL = url.endsWith('/api') ? url : url + "/api";
const Api: AxiosInstance = axios.create({ baseURL });

Api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem("token");

  if (token) config.headers.set("Authorization", `Bearer ${token}`);

  return config;
});

Api.interceptors.response.use(
  async (res: AxiosResponse) => res.data,
  async (err: AxiosError) => Promise.reject(err)
);

export { Api };
