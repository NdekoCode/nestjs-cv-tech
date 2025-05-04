import { api } from '../api-client';

export const sendAuthCodeAPI = (email: string) => {

	return api.post<{ status: number; message: string }>(`/auth/send-code`, {
		email,
	});
};