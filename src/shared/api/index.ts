import axios from "axios";
import i18n from "../config/i18n";

const baseURL = import.meta.env.VITE_BASE_URL;

const API = axios.create({
  baseURL,
});

API.interceptors.request.use(
  function (config) {
    config.headers["Accept-Language"] = i18n.language;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
export default API;

export const authApi = axios.create({
  baseURL,
});

authApi.interceptors.request.use(
  function (config) {
    config.headers["Accept-Language"] = i18n.language;
    const token = localStorage.getItem("carrier_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
