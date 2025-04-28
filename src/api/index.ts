import axios from "axios";

export const api = axios.create({
  baseURL: "/api/proxy",
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});
