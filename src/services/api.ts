import { SERVER_CONFIG } from '../config/server';

class ApiService {
  private static baseUrl = `${SERVER_CONFIG.API_URL}/api`;

  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }

  static async get(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        credentials: 'include'
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }

  static async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }

  static async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }

  static async delete(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  }
}

export const api = ApiService;