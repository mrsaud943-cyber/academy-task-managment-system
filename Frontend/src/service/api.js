import axios from "axios";

console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.response.use(

    response => response,

    error => {

        console.log(error.response);

        return Promise.reject(error);

    }

);

export default api;