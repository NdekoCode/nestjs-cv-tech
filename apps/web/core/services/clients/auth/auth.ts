interface IUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}
import { api } from '../api-client';
import { ApiErrorService } from '../api-error.service';
import { APIService } from '../api.service';

export const sendAuthCodeAPI = (email: string) => {
  return api.post<{ status: number; message: string }>(`/auth/send-code`, {
    email,
  });
};

export const getUser = async (id: number) => {
  try {
    const apiClient = new APIService({
      baseURL: "https://jsonplaceholder.typicode.com",
    });
    const data = await apiClient.get<IUser>(`/users/${id}`);
    console.log(data);
    return data;
  } catch (error) {
    throw ApiErrorService.fromAxiosError(error);
  }
};
