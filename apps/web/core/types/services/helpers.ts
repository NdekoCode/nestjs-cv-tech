import { AxiosError, AxiosResponse } from 'axios';

// Hook de réponse pour les middlewares
export type ResponseInterceptor<T = any> = (
  response: AxiosResponse<T>
) => AxiosResponse<T> | Promise<AxiosResponse<T>>;
export type ErrorInterceptor = (error: AxiosError) => any;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Types utilitaires pour les requêtes avec cache
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}


  // Configuration du client HTTP
  export interface HttpClientConfig {
    baseURL?: string;
    token?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    customHeaders?: Record<string, string>;
    withCredentials?: boolean;
    loggerConfig?: HttpLoggerConfig;
  }
export interface HttpLoggerConfig {
    logRequestData?: boolean;
    logResponseData?: boolean;
    logErrorData?: boolean;
    excludeUrls?: RegExp[];
    sensitiveHeaders?: string[];
  }

  // Types d'erreurs API personnalisées
  export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
  }
  
  export interface ApiErrorResponse {
    message: string;
    code?: string;
    details?: Record<string, any>;
  }
  