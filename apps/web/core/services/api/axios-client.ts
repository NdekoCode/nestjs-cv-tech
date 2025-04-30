import axios, { AxiosInstance } from 'axios';

export const createAxiosClient = (baseURL?: string): AxiosInstance => {
    const URL= baseURL ?? process.env.NEXT_PUBLIC_API_URL;
  const client = axios.create({
    baseURL: URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      console.error("[Axios Error]", error?.response?.data || error.message);
      return Promise.reject(error);
    }
  );
  return client;
};
