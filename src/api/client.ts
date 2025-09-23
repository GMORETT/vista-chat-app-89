import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../models';

// Base client for API calls to BFF
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_BFF_BASE_URL || 'http://localhost:3001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      // TODO: Add authentication token when available
      // const token = getAuthToken();
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        // Error logged by interceptor
        
        // Handle common errors
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message || error.message || 'Request failed',
      };
    }
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message || error.message || 'Request failed',
      };
    }
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message || error.message || 'Request failed',
      };
    }
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, data);
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message || error.message || 'Request failed',
      };
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message || error.message || 'Request failed',
      };
    }
  }

  // Special method for file uploads
  async uploadFiles<T = any>(url: string, files: File[], data?: any): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('files', file);
      });

      if (data) {
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
      }

      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.message || error.message || 'Upload failed',
      };
    }
  }
}

export const apiClient = new ApiClient();