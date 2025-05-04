import { ApiErrorService } from './api-error.service';
import { getUser } from './auth/auth';
import { createAxiosClient } from './axios-client';

export const api = createAxiosClient();

export const run = async () => {
  const userID = 9999;
  try {
    const user = await getUser(userID);

    console.log("Utilisateur trouvé :", user);
  } catch (error) {
    if (ApiErrorService.isApiError(error)) {
      console.log("❌ Api Error detected",error);
      console.log("Message", error.message);
      console.log("Detail:", error.details);
      console.log("Code interne :", error.errorCode);
      console.log("HTTP code", error.statusCode);
    }
  }
};
