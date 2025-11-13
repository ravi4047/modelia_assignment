// src/services/api.ts

import axios, { AxiosError, type AxiosInstance } from 'axios';
import type {
  AuthResponse,
  GenerationResponse,
  GenerationHistoryResponse,
  GenerationRequest,
  ApiError,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 60000, // 60 seconds for image generation

      // Do not set default as it will affect during post generation upload image.
      // headers: {
      //   'Content-Type': 'application/json',
      // },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    // this.client.interceptors.response.use(
    //   (response) => response,
    //   (error: AxiosError<ApiError>) => {
    //     if (error.response?.status === 401) {
    //       // Token expired or invalid
    //       localStorage.removeItem('auth_token');
    //       localStorage.removeItem('user');
    //       window.location.href = '/login';
    //     }
    //     return Promise.reject(error);
    //   }
    // );

    // inside ApiService constructor -> response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Clear auth storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');

          // Decide whether to notify app to navigate to /login
          try {
            const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
            const authPaths = ['/login', '/signup'];

            // If we are NOT currently on an auth page, notify the app.
            if (!authPaths.includes(pathname)) {
              // Prefer dispatching an event so React can handle a client-side navigate
              window.dispatchEvent(new CustomEvent('app:unauthorized'));
            } else {
              // Already on login/signup — do not navigate (no event)
              console.debug('401 received but already on auth page; not navigating.');
            }
          } catch (err) {
            console.log(err)
            // Fallback: if anything goes wrong, still notify so user isn't stuck
            window.dispatchEvent(new CustomEvent('app:unauthorized'));
          }
        }
        return Promise.reject(error);
      }
    );


  }

  // Auth endpoints
  async signup(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/api/auth/signup', {
      email,
      password,
    });
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return data;
  }

  // Image generation endpoints
  async generateImage(
    request: GenerationRequest,
    signal?: AbortSignal
  ): Promise<GenerationResponse> {
    const formData = new FormData();
    console.log(request.imageFile)
    formData.append('image', request.imageFile);
    formData.append('prompt', request.prompt);
    formData.append('style', request.style);

    // Simulate 20% error rate for "Model overloaded"
    if (Math.random() < 0.2) {
      throw new Error('Model overloaded. Please try again.');
    }

    const { data } = await this.client.post<GenerationResponse>(
      '/api/generations',
      formData,
      {
        /// Do not set this manually
        // headers: {
        //   'Content-Type': 'multipart/form-data',
        // },
        signal,
      }
    );

    return data;
  }

  async getGenerationHistory(
    page: number = 1,
    limit: number = 5
  ): Promise<GenerationHistoryResponse> {
    const { data } = await this.client.get<GenerationHistoryResponse>(
      '/api/generations',
      {
        params: { page, limit },
      }
    );
    return data;
  }

  async getGenerationById(id: string): Promise<GenerationResponse> {
    const { data } = await this.client.get<GenerationResponse>(
      `/api/generations/${id}`
    );
    return data;
  }

  // Helper to extract error message
  getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      return apiError?.error?.message || error.message || 'An error occurred';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred';
  }
}

export const apiService = new ApiService();