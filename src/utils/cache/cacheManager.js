export class CacheManager {
  constructor(namespace = 'app-cache') {
    this.namespace = namespace;
    this.memoryCache = new Map();
    this.db = null;
  }

  async init() {
    if (!('indexedDB' in window)) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.namespace, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  async get(key, options = {}) {
    const { useMemory = true, useIndexedDB = true } = options;

    // Check memory cache first
    if (useMemory) {
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem && !this.isExpired(memoryItem)) {
        return memoryItem.value;
      }
    }

    // Check IndexedDB
    if (useIndexedDB && this.db) {
      const item = await this.getFromIndexedDB(key);
      if (item && !this.isExpired(item)) {
        // Update memory cache
        if (useMemory) {
          this.memoryCache.set(key, item);
        }
        return item.value;
      }
    }

    return null;
  }

  async set(key, value, options = {}) {
    const {
      useMemory = true,
      useIndexedDB = true,
      ttl = 3600 // 1 hour default
    } = options;

    const item = {
      key,
      value,
      timestamp: Date.now(),
      expiry: ttl ? Date.now() + (ttl * 1000) : null
    };

    // Set in memory cache
    if (useMemory) {
      this.memoryCache.set(key, item);
    }

    // Set in IndexedDB
    if (useIndexedDB && this.db) {
      await this.setInIndexedDB(item);
    }
  }

  async clear(options = {}) {
    const { useMemory = true, useIndexedDB = true } = options;

    if (useMemory) {
      this.memoryCache.clear();
    }

    if (useIndexedDB && this.db) {
      await this.clearIndexedDB();
    }
  }

  private isExpired(item) {
    return item.expiry && Date.now() > item.expiry;
  }

  private async getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async setInIndexedDB(item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async clearIndexedDB() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}