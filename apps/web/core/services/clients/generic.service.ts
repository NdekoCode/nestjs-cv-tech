// core/services/api/clients/http-client.ts
import axios, {
    AxiosError, AxiosInstance, AxiosProgressEvent, AxiosRequestConfig, AxiosResponse,
    CancelTokenSource
} from 'axios';

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
  
  export class ApiError extends Error {
    public readonly statusCode: number; // Le code HTTP (ex:404)
    public readonly isApiError = true; // Pour le reconnaître facilement
    public readonly errorCode?: string; // un code interne (ex: USER_NOT_FOUND)
    public readonly details?: Record<string, any>; // infos en plus sur l'erreur
    public readonly timestamp: Date; // La date ou l'erreur est arriver
  
    constructor(message: string, statusCode: number, errorCode?: string, details?: Record<string, any>) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.errorCode = errorCode;
      this.details = details;
      this.timestamp = new Date();
      
      // Pour que instanceof fonctionne correctement avec des classes étendues
      Object.setPrototypeOf(this, ApiError.prototype);
    }
  
    static fromAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
      const response = error.response;
      const fallbackMessage = `Erreur de requête (${error.code || 'unknown'})`;
      
      if (!response) {
        return new ApiError(error.message || fallbackMessage, 0);
      }
  
      const data = response.data;
      const message = data?.message || fallbackMessage;
      const code = data?.code;
      const details = data?.details;
  
      return new ApiError(message, response.status, code, details);
    }
  
    static isApiError(error: any): error is ApiError {
      return error && error.isApiError === true;
    }
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
  }
  
  // Hook de réponse pour les middlewares
  export type ResponseInterceptor<T = any> = (response: AxiosResponse<T>) => AxiosResponse<T> | Promise<AxiosResponse<T>>;
  export type ErrorInterceptor = (error: AxiosError) => any;
  
  // Types utilitaires pour les requêtes avec cache
  interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiry: number;
  }
  
  export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  
 
export class APIService {
    protected readonly instance: AxiosInstance;
    private readonly cache: Map<string, CacheItem<any>> = new Map();
    private readonly pendingRequests: Map<string, Promise<any>> = new Map();
    private readonly config: Required<HttpClientConfig>;
    private cancelSources: Map<string, CancelTokenSource> = new Map();
  
    private static readonly DEFAULT_CONFIG: Required<HttpClientConfig> = {
      baseURL: '',
      token: '',
      timeout: 30000,
      retries: 0,
      retryDelay: 1000,
      customHeaders: {},
      withCredentials: true
    };
  
    constructor(config?: HttpClientConfig) {
      this.config = {
        ...APIService.DEFAULT_CONFIG,
        ...config,
        customHeaders: {
          ...APIService.DEFAULT_CONFIG.customHeaders,
          ...config?.customHeaders
        }
      };
  
      this.instance = axios.create({
        baseURL: this.config.baseURL || process.env.NEXT_PUBLIC_API_URL,
        timeout: this.config.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.config.customHeaders,
          ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}),
        },
        withCredentials: this.config.withCredentials,
      });
  
      this._initializeInterceptors();
    }
  
    /**
     * Définit le token d'authentification pour les futures requêtes
     */
    public setAuthToken(token: string): void {
      this.config.token = token;
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  
    /**
     * Efface le token d'authentification
     */
    public clearAuthToken(): void {
      this.config.token = '';
      delete this.instance.defaults.headers.common['Authorization'];
    }
  
    /**
     * Ajoute un header personnalisé pour toutes les futures requêtes
     */
    public setHeader(name: string, value: string): void {
      this.config.customHeaders[name] = value;
      this.instance.defaults.headers.common[name] = value;
    }
  
    /**
     * Annule toutes les requêtes en cours
     */
    public cancelAllRequests(reason = 'Operation cancelled by user'): void {
      this.cancelSources.forEach((source) => {
        source.cancel(reason);
      });
      this.cancelSources.clear();
    }
  
    /**
     * Annule une requête spécifique basée sur son identifiant
     */
    public cancelRequest(requestId: string, reason = 'Operation cancelled'): void {
      const source = this.cancelSources.get(requestId);
      if (source) {
        source.cancel(reason);
        this.cancelSources.delete(requestId);
      }
    }
  
    /**
     * Effectue une requête GET
     * @param url URL de la requête
     * @param config Configuration de la requête
     * @param cacheOptions Options de mise en cache
     */
    public async get<T>(
      url: string, 
      config?: AxiosRequestConfig, 
      cacheOptions?: { ttl: number; bypassCache?: boolean }
    ): Promise<T> {
      const cacheKey = this._getCacheKey(url, config?.params);
      
      // Vérifier le cache si les options de cache sont spécifiées et on ne bypass pas le cache
      if (cacheOptions && !cacheOptions.bypassCache) {
        const cachedData = this._getFromCache<T>(cacheKey);
        if (cachedData) return cachedData;
      }
  
      // Dédupliquer les requêtes en cours
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey) as Promise<T>;
      }
  
      // Préparation de la token d'annulation
      const source = axios.CancelToken.source();
      this.cancelSources.set(cacheKey, source);
      
      const requestConfig: AxiosRequestConfig = {
        ...config,
        cancelToken: source.token
      };
  
      // Effectuer la requête avec logique de retry
      const requestPromise = this._executeWithRetry<T>(() => 
        this.instance.get<T>(url, requestConfig).then(this._unwrapResponse)
      ).then(data => {
        // Mettre en cache si nécessaire
        if (cacheOptions) {
          this._saveToCache(cacheKey, data, cacheOptions.ttl);
        }
        this.pendingRequests.delete(cacheKey);
        this.cancelSources.delete(cacheKey);
        return data;
      }).catch(error => {
        this.pendingRequests.delete(cacheKey);
        this.cancelSources.delete(cacheKey);
        throw error;
      });
  
      this.pendingRequests.set(cacheKey, requestPromise);
      return requestPromise;
    }
  
    /**
     * Effectue une requête POST
     * @param url URL de la requête
     * @param data Données à envoyer
     * @param config Configuration de la requête
     */
    public async post<T, D = any>(
      url: string, 
      data?: D, 
      config?: AxiosRequestConfig
    ): Promise<T> {
      const requestId = `POST:${url}:${Date.now()}`;
      const source = axios.CancelToken.source();
      this.cancelSources.set(requestId, source);
  
      const requestConfig: AxiosRequestConfig = {
        ...config,
        cancelToken: source.token
      };
  
      try {
        const response = await this._executeWithRetry<T>(() => 
          this.instance.post<T>(url, data, requestConfig).then(this._unwrapResponse)
        );
        this.cancelSources.delete(requestId);
        return response;
      } catch (error) {
        this.cancelSources.delete(requestId);
        throw error;
      }
    }
  
    /**
     * Effectue une requête PUT
     * @param url URL de la requête
     * @param data Données à envoyer
     * @param config Configuration de la requête
     */
    public async put<T, D = any>(
      url: string, 
      data?: D, 
      config?: AxiosRequestConfig
    ): Promise<T> {
      const requestId = `PUT:${url}:${Date.now()}`;
      const source = axios.CancelToken.source();
      this.cancelSources.set(requestId, source);
  
      const requestConfig: AxiosRequestConfig = {
        ...config,
        cancelToken: source.token
      };
  
      try {
        const response = await this._executeWithRetry<T>(() => 
          this.instance.put<T>(url, data, requestConfig).then(this._unwrapResponse)
        );
        this.cancelSources.delete(requestId);
        return response;
      } catch (error) {
        this.cancelSources.delete(requestId);
        throw error;
      }
    }
  
    /**
     * Effectue une requête PATCH
     * @param url URL de la requête
     * @param data Données à envoyer
     * @param config Configuration de la requête
     */
    public async patch<T, D = any>(
      url: string, 
      data?: D, 
      config?: AxiosRequestConfig
    ): Promise<T> {
      const requestId = `PATCH:${url}:${Date.now()}`;
      const source = axios.CancelToken.source();
      this.cancelSources.set(requestId, source);
  
      const requestConfig: AxiosRequestConfig = {
        ...config,
        cancelToken: source.token
      };
  
      try {
        const response = await this._executeWithRetry<T>(() => 
          this.instance.patch<T>(url, data, requestConfig).then(this._unwrapResponse)
        );
        this.cancelSources.delete(requestId);
        return response;
      } catch (error) {
        this.cancelSources.delete(requestId);
        throw error;
      }
    }
  
    /**
     * Effectue une requête DELETE
     * @param url URL de la requête
     * @param config Configuration de la requête
     */
    public async delete<T>(
      url: string, 
      config?: AxiosRequestConfig
    ): Promise<T> {
      const requestId = `DELETE:${url}:${Date.now()}`;
      const source = axios.CancelToken.source();
      this.cancelSources.set(requestId, source);
  
      const requestConfig: AxiosRequestConfig = {
        ...config,
        cancelToken: source.token
      };
  
      try {
        const response = await this._executeWithRetry<T>(() => 
          this.instance.delete<T>(url, requestConfig).then(this._unwrapResponse)
        );
        this.cancelSources.delete(requestId);
        return response;
      } catch (error) {
        this.cancelSources.delete(requestId);
        throw error;
      }
    }
  
    /**
     * Téléchargement de fichier avec progression
     */
    public async downloadFile(
      url: string,
      onProgress?: (progressEvent:AxiosProgressEvent) => void,
      config?: AxiosRequestConfig
    ): Promise<Blob> {
      const requestId = `DOWNLOAD:${url}:${Date.now()}`;
      const source = axios.CancelToken.source();
      this.cancelSources.set(requestId, source);
  
      const requestConfig: AxiosRequestConfig = {
        ...config,
        responseType: 'blob',
        cancelToken: source.token,
        onDownloadProgress: onProgress
      };
  
      try {
        const response = await this.instance.get<Blob>(url, requestConfig);
        this.cancelSources.delete(requestId);
        return response.data;
      } catch (error) {
        this.cancelSources.delete(requestId);
        throw error;
      }
    }
  
    /**
     * Upload de fichier avec progression
     */
    public async uploadFile<T>(
      url: string,
      file: File | Blob | FormData,
      onProgress?:  (progressEvent: AxiosProgressEvent) => void,
      config?: AxiosRequestConfig
    ): Promise<T> {
      const requestId = `UPLOAD:${url}:${Date.now()}`;
      const source = axios.CancelToken.source();
      this.cancelSources.set(requestId, source);
  
      let formData: FormData;
      if (file instanceof FormData) {
        formData = file;
      } else {
        formData = new FormData();
        formData.append('file', file);
      }
  
      const requestConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data'
        },
        cancelToken: source.token,
        onUploadProgress: onProgress
      };
  
      try {
        const response = await this._executeWithRetry<T>(() => 
          this.instance.post<T>(url, formData, requestConfig).then(this._unwrapResponse)
        );
        this.cancelSources.delete(requestId);
        return response;
      } catch (error) {
        this.cancelSources.delete(requestId);
        throw error;
      }
    }
  
    /**
     * Exécution d'une requête avec mécanisme de retry
     */
    private async _executeWithRetry<T>(
      requestFn: () => Promise<T>, 
      retryCount = 0
    ): Promise<T> {
      try {
        return await requestFn();
      } catch (error) {
        const axiosError = error as AxiosError;
        
        // Ne pas retenter si la requête a été annulée intentionnellement
        if (axios.isCancel(axiosError)) {
          throw axiosError;
        }
  
        // Vérifier si on doit retenter (uniquement pour certaines erreurs et si des tentatives restent)
        const isRetryable = this._isRetryableError(axiosError);
        const canRetry = retryCount < this.config.retries && isRetryable;
  
        if (canRetry) {
          const delay = this._getRetryDelay(retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this._executeWithRetry(requestFn, retryCount + 1);
        }
  
        // Transformer l'erreur avant de la rejeter
        throw this._handleError(axiosError);
      }
    }
  
    /**
     * Détermine si une erreur est de type à être retentée
     */
    private _isRetryableError(error: AxiosError): boolean {
      // Pas de réponse (problème réseau)
      if (!error.response) {
        return true;
      }
  
      // Erreurs serveur (5xx)
      if (error.response.status >= 500 && error.response.status < 600) {
        return true;
      }
  
      // Pour certaines erreurs 4xx spécifiques (e.g. 429 Too Many Requests)
      if (error.response.status === 429) {
        return true;
      }
  
      return false;
    }
  
    /**
     * Calcule le délai avant la prochaine tentative (avec backoff exponentiel)
     */
    private _getRetryDelay(retryCount: number): number {
      const baseDelay = this.config.retryDelay;
      const exponentialDelay = baseDelay * Math.pow(2, retryCount);
      const jitter = Math.random() * 100; // Ajouter du jitter pour éviter les tempêtes de requêtes
      return exponentialDelay + jitter;
    }
  
    /**
     * Initialise les intercepteurs de requêtes et réponses
     */
    private _initializeInterceptors() {
      // Intercepteur de requête
      this.instance.interceptors.request.use(
        (config) => {
          // Ajouter un timestamp pour éviter le cache du navigateur si nécessaire
          if (config.method?.toLowerCase() === 'get' && config.params !== undefined) {
            config.params = { 
              ...config.params, 
              _t: new Date().getTime() 
            };
          }
          return config;
        },
        (error) => Promise.reject(error)
      );
  
      // Intercepteur de réponse
      this.instance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
          // Logger l'erreur mais la laisser se propager
          const statusCode = error.response?.status;
          const url = error.config?.url;
          const method = error.config?.method?.toUpperCase();
          
          console.error(`[HttpClient Error ${statusCode}] ${method} ${url}`, 
            error.response?.data || error.message);
          
          return Promise.reject(error);
        }
      );
    }
  
    /**
     * Extrait les données de la réponse
     */
    private _unwrapResponse<T>(response: AxiosResponse<T>): T {
      return response.data;
    }
  
    /**
     * Transforme les erreurs Axios en ApiError pour une meilleure gestion
     */
    private _handleError(error: AxiosError): never {
      if (axios.isCancel(error)) {
        throw new Error('Request cancelled');
      }
  
      throw ApiError.fromAxiosError(error);
    }
  
    /**
     * Génère une clé de cache pour une URL et ses paramètres
     */
    private _getCacheKey(url: string, params?: Record<string, any>): string {
      const sortedParams = params 
        ? Object.keys(params)
            .sort()
            .reduce((result, key) => {
              result[key] = params[key];
              return result;
            }, {} as Record<string, any>)
        : undefined;
      
      return `${url}:${sortedParams ? JSON.stringify(sortedParams) : ''}`;
    }
  
    /**
     * Récupère des données du cache si elles sont encore valides
     */
    private _getFromCache<T>(key: string): T | null {
      const cached = this.cache.get(key);
      
      if (!cached) {
        return null;
      }
  
      const now = Date.now();
      if (now > cached.expiry) {
        // Données expirées
        this.cache.delete(key);
        return null;
      }
  
      return cached.data as T;
    }
  
    /**
     * Enregistre des données dans le cache avec une durée de vie
     */
    private _saveToCache<T>(key: string, data: T, ttlMs: number): void {
      const now = Date.now();
      const expiry = now + ttlMs;
      
      this.cache.set(key, {
        data,
        timestamp: now,
        expiry
      });
    }
  
    /**
     * Vide le cache entièrement ou pour une URL spécifique
     */
    public clearCache(urlPattern?: RegExp): void {
      if (!urlPattern) {
        this.cache.clear();
        return;
      }
  
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (urlPattern.test(key.split(':')[0])) {
          keysToDelete.push(key);
        }
      });
  
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  
    /**
     * Ajoute un intercepteur personnalisé
     */
    public addResponseInterceptor(
      onFulfilled?: ResponseInterceptor,
      onRejected?: ErrorInterceptor
    ): number {
      return this.instance.interceptors.response.use(
        onFulfilled, 
        onRejected
      );
    }
  
    /**
     * Supprime un intercepteur par son ID
     */
    public removeResponseInterceptor(id: number): void {
      this.instance.interceptors.response.eject(id);
    }
  }