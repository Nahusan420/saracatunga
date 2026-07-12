/**
 * IMPORMOT API Service Client
 * Provides typed, structured fetch wrapper functions for accessing backend endpoints.
 */

import { Product, Brand, Category, Order, User, Notification, MotoModel } from '../types';

/**
 * Custom Error Class for IMPORMOT API requests
 */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic request helper with auth token handling
 */
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const token = localStorage.getItem('impormot_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // --- AUTH ENDPOINTS ---
  auth: {
    me: async (): Promise<User> => {
      return apiRequest<User>('/api/auth/me');
    },
    login: async (email: string, passwordHash: string): Promise<{ token: string; user: User }> => {
      return apiRequest<{ token: string; user: User }>('/api/auth/login', 'POST', { email, passwordHash });
    },
    register: async (userData: Partial<User> & { passwordHash: string }): Promise<{ token: string; user: User }> => {
      return apiRequest<{ token: string; user: User }>('/api/auth/register', 'POST', userData);
    },
    updateProfile: async (userData: Partial<User>): Promise<User> => {
      return apiRequest<User>('/api/auth/profile', 'PUT', userData);
    }
  },

  // --- CATALOG ENDPOINTS ---
  products: {
    list: async (): Promise<Product[]> => {
      return apiRequest<Product[]>('/api/products');
    },
    get: async (id: string): Promise<Product> => {
      return apiRequest<Product>(`/api/products/${id}`);
    },
    create: async (productData: Partial<Product>): Promise<Product> => {
      return apiRequest<Product>('/api/products', 'POST', productData);
    },
    update: async (id: string, productData: Partial<Product>): Promise<Product> => {
      return apiRequest<Product>(`/api/products/${id}`, 'PUT', productData);
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return apiRequest<{ success: boolean }>(`/api/products/${id}`, 'DELETE');
    }
  },

  // --- BRANDS & TAXONOMY ---
  brands: {
    list: async (): Promise<Brand[]> => {
      return apiRequest<Brand[]>('/api/brands');
    },
    create: async (brand: Partial<Brand>): Promise<Brand> => {
      return apiRequest<Brand>('/api/brands', 'POST', brand);
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return apiRequest<{ success: boolean }>(`/api/brands/${id}`, 'DELETE');
    }
  },

  categories: {
    list: async (): Promise<Category[]> => {
      return apiRequest<Category[]>('/api/categories');
    },
    create: async (category: Partial<Category>): Promise<Category> => {
      return apiRequest<Category>('/api/categories', 'POST', category);
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return apiRequest<{ success: boolean }>(`/api/categories/${id}`, 'DELETE');
    }
  },

  motoModels: {
    list: async (): Promise<MotoModel[]> => {
      return apiRequest<MotoModel[]>('/api/moto-models');
    },
    create: async (model: Partial<MotoModel>): Promise<MotoModel> => {
      return apiRequest<MotoModel>('/api/moto-models', 'POST', model);
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return apiRequest<{ success: boolean }>(`/api/moto-models/${id}`, 'DELETE');
    }
  },

  // --- ORDERS ---
  orders: {
    list: async (): Promise<Order[]> => {
      return apiRequest<Order[]>('/api/orders');
    },
    create: async (orderData: Partial<Order>): Promise<Order> => {
      return apiRequest<Order>('/api/orders', 'POST', orderData);
    },
    updateStatus: async (id: string, status: string, notes?: string): Promise<Order> => {
      return apiRequest<Order>(`/api/orders/${id}/status`, 'PUT', { status, notes });
    }
  },

  // --- NOTIFICATIONS ---
  notifications: {
    list: async (): Promise<Notification[]> => {
      return apiRequest<Notification[]>('/api/notifications');
    },
    markRead: async (id: string): Promise<Notification> => {
      return apiRequest<Notification>(`/api/notifications/${id}/read`, 'PUT');
    },
    create: async (notificationData: Partial<Notification>): Promise<Notification> => {
      return apiRequest<Notification>('/api/notifications', 'POST', notificationData);
    }
  },

  // --- ADMIN SPECIALS ---
  admin: {
    metrics: async (): Promise<{
      totalSales: number;
      pendingOrders: number;
      activeUsers: number;
      stockAlerts: number;
      salesHistory: { date: string; amount: number }[];
      categoryDistribution: { name: string; value: number }[];
    }> => {
      return apiRequest('/api/admin/metrics');
    },
    users: {
      list: async (): Promise<User[]> => {
        return apiRequest<User[]>('/api/admin/users');
      },
      updateRole: async (id: string, role: 'user' | 'admin'): Promise<User> => {
        return apiRequest<User>(`/api/admin/users/${id}/role`, 'PUT', { role });
      },
      delete: async (id: string): Promise<{ success: boolean }> => {
        return apiRequest<{ success: boolean }>(`/api/admin/users/${id}`, 'DELETE');
      }
    }
  }
};
