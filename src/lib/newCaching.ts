import { createClient } from '@supabase/supabase-js';

// In-memory cache with TTL
const memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache configuration
const CACHE_CONFIG = {
  MEMORY_TTL: 5 * 60 * 1000, // 5 minutes
  SESSION_TTL: 24 * 60 * 60 * 1000, // 24 hours
  MAX_MEMORY_SIZE: 100 // Maximum number of items in memory cache
};

// Cache utilities
export class Cache {
  // Get item from memory cache
  static get<T>(key: string): T | null {
    const cached = memoryCache.get(key);
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      memoryCache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  // Set item in memory cache
  static set(key: string, data: any, ttl: number = CACHE_CONFIG.MEMORY_TTL) {
    // Clean up expired items and enforce size limit
    this.cleanup();
    
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Enforce max size
    if (memoryCache.size > CACHE_CONFIG.MAX_MEMORY_SIZE) {
      // Remove oldest items
      const sortedEntries = Array.from(memoryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      while (memoryCache.size > CACHE_CONFIG.MAX_MEMORY_SIZE) {
        memoryCache.delete(sortedEntries.shift()![0]);
      }
    }
  }

  // Remove item from memory cache
  static delete(key: string) {
    memoryCache.delete(key);
  }

  // Clear all memory cache
  static clear() {
    memoryCache.clear();
  }

  // Cleanup expired items
  static cleanup() {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        memoryCache.delete(key);
      }
    }
  }

  // Invalidate cache by pattern (e.g., 'products:*')
  static invalidatePattern(pattern: string) {
    const keysToDelete: string[] = [];
    
    // Convert pattern to regex (simple implementation)
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => memoryCache.delete(key));
  }
}

// Session storage cache (persists across page reloads)
export class SessionCache {
  private static readonly PREFIX = 'perfume_cache_';
  
  // Get item from session storage
  static get<T>(key: string): T | null {
    try {
      const stored = sessionStorage.getItem(this.PREFIX + key);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() > parsed.expiry) {
        sessionStorage.removeItem(this.PREFIX + key);
        return null;
      }
      
      return parsed.data as T;
    } catch (error) {
      console.error('Error reading from session cache:', error);
      return null;
    }
  }

  // Set item in session storage
  static set(key: string, data: any, ttl: number = CACHE_CONFIG.SESSION_TTL) {
    try {
      const expiry = Date.now() + ttl;
      const value = {
        data,
        expiry
      };
      sessionStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to session cache:', error);
    }
  }

  // Remove item from session storage
  static delete(key: string) {
    try {
      sessionStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('Error removing from session cache:', error);
    }
  }

  // Clear all session storage cache
  static clear() {
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing session cache:', error);
    }
  }
}

// Cache invalidation strategies
export class CacheInvalidation {
  private static readonly PREFIX = 'perfume_cache_';
  
  // Invalidate all product-related caches
  static invalidateProducts() {
    // Clear memory cache entries related to products
    Cache.invalidatePattern('products*');
    Cache.invalidatePattern('featured_products*');
    
    // Clear session storage entries related to products
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX + 'products:') || 
            key.startsWith(this.PREFIX + 'featured_products')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error invalidating session storage:', error);
    }
  }

  // Invalidate specific product cache
  static invalidateProduct(productId: string) {
    Cache.invalidatePattern(`products:${productId}`);
    Cache.invalidatePattern('featured_products*');
    
    try {
      Object.keys(sessionStorage).forEach(key => {
        if ((key.startsWith(this.PREFIX + 'products:') && key.includes(productId)) ||
            key.startsWith(this.PREFIX + 'featured_products')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error invalidating session storage:', error);
    }
  }

  // Invalidate all category-related caches
  static invalidateCategories() {
    Cache.invalidatePattern('categories*');
    
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX + 'categories:')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error invalidating session storage:', error);
    }
  }

  // Invalidate specific category cache
  static invalidateCategory(categoryId: string) {
    Cache.invalidatePattern(`categories:${categoryId}`);
    
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX + 'categories:') && key.includes(categoryId)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error invalidating session storage:', error);
    }
  }

  // Invalidate all order-related caches
  static invalidateOrders() {
    Cache.invalidatePattern('orders*');
    
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX + 'orders:')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error invalidating session storage:', error);
    }
  }

  // Invalidate specific order cache
  static invalidateOrder(orderId: string) {
    Cache.invalidatePattern(`orders:${orderId}`);
    
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX + 'orders:') && key.includes(orderId)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error invalidating session storage:', error);
    }
  }

  // Invalidate all user-related caches
  static invalidateUsers() {
    Cache.invalidatePattern('users*');
    
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX + 'users:')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error invalidating session storage:', error);
    }
  }

  // Invalidate specific user cache
  static invalidateUser(userId: string) {
    Cache.invalidatePattern(`users:${userId}`);
    
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX + 'users:') && key.includes(userId)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error invalidating session storage:', error);
    }
  }
}

// Decorator for caching function results
export function Cacheable(ttl: number = CACHE_CONFIG.MEMORY_TTL) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      // Create cache key from method name and arguments
      const key = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache first
      const cachedResult = Cache.get(key);
      if (cachedResult !== null) {
        return cachedResult;
      }
      
      // Execute the original method
      const result = originalMethod.apply(this, args);
      
      // If result is a promise, handle async case
      if (result instanceof Promise) {
        return result.then(data => {
          Cache.set(key, data, ttl);
          return data;
        });
      }
      
      // Cache the result
      Cache.set(key, result, ttl);
      return result;
    };
    
    return descriptor;
  };
}