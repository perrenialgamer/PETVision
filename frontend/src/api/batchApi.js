import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const analyzeBatch = (formData) =>
  API.post("/batch/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
