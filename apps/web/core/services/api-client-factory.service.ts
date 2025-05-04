// core/services/api/api-client.factory.ts
import { HttpClientConfig } from '../types/services';
import { APIService } from './clients/api.service';
import { Logger } from './log/logger.service';

/**
 * Singleton pour la gestion des clients API
 */
export class ApiClientFactory {
  private static instance: ApiClientFactory;
  private defaultClient: APIService | null = null;
  private clients: Map<string, APIService> = new Map();
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance({
      logDir: process.env.LOG_DIR || 'logs',
      console: process.env.NODE_ENV !== 'production',
      environment: process.env.NODE_ENV as any || 'development',
      dateFormat: 'daily'
    });
  }

  /**
   * Obtient l'instance singleton de la factory
   */
  public static getInstance(): ApiClientFactory {
    if (!ApiClientFactory.instance) {
      ApiClientFactory.instance = new ApiClientFactory();
    }
    return ApiClientFactory.instance;
  }

  /**
   * Initialise le client HTTP par défaut
   */
  public initializeDefaultClient(config?: HttpClientConfig): APIService {
    if (!this.defaultClient) {
      const defaultConfig: HttpClientConfig = {
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        timeout: 30000,
        retries: 2,
        retryDelay: 500,
        withCredentials: true,
        loggerConfig: {
          logRequestData: true,
          logResponseData: process.env.NODE_ENV === 'development',
          logErrorData: true,
          excludeUrls: [/\/health$/, /\/ping$/]
        },
        ...config
      };

      this.defaultClient = new APIService(defaultConfig);
      this.logger.info('Default API client initialized', { baseURL: defaultConfig.baseURL }, 'ApiClientFactory');
    }
    
    return this.defaultClient;
  }

  /**
   * Obtient le client HTTP par défaut
   */
  public getDefaultClient(): APIService {
    if (!this.defaultClient) {
      return this.initializeDefaultClient();
    }
    return this.defaultClient;
  }

  /**
   * Crée ou récupère un client HTTP nommé avec une configuration spécifique
   */
  public getClient(name: string, config?: HttpClientConfig): APIService {
    if (!this.clients.has(name)) {
      const clientConfig: HttpClientConfig = {
        ...config,
        loggerConfig: {
          ...config?.loggerConfig,
          // Ajouter le nom du client dans les logs pour une meilleure identification
          excludeUrls: [...(config?.loggerConfig?.excludeUrls || [])],
        }
      };
      
      const client = new APIService(clientConfig);
      this.clients.set(name, client);
      this.logger.info(`API client "${name}" created`, { baseURL: clientConfig.baseURL }, 'ApiClientFactory');
    }
    
    return this.clients.get(name)!;
  }

  /**
   * Réinitialise tous les clients (utile pour les tests)
   */
  public resetClients(): void {
    this.defaultClient = null;
    this.clients.clear();
    this.logger.info('All API clients have been reset', {}, 'ApiClientFactory');
  }
}

/**
 * Fonction helper pour obtenir le client API par défaut
 */
export function getApiClient(): APIService {
  return ApiClientFactory.getInstance().getDefaultClient();
}

/**
 * Fonction helper pour obtenir un client API nommé
 */
export function getNamedApiClient(name: string, config?: HttpClientConfig): APIService {
  return ApiClientFactory.getInstance().getClient(name, config);
}