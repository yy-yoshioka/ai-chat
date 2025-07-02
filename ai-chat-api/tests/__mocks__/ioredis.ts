class Redis {
  private store: Map<string, any> = new Map();
  private ttls: Map<string, number> = new Map();

  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  async get(key: string): Promise<string | null> {
    const value = this.store.get(key);
    return value !== undefined ? String(value) : null;
  }

  async set(key: string, value: any, ...args: any[]): Promise<'OK'> {
    this.store.set(key, value);
    
    // Handle TTL if provided
    if (args[0] === 'EX' && args[1]) {
      this.ttls.set(key, Date.now() + args[1] * 1000);
    }
    
    return 'OK';
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    let count = 0;
    
    for (const k of keys) {
      if (this.store.delete(k)) {
        this.ttls.delete(k);
        count++;
      }
    }
    
    return count;
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (this.store.has(key)) {
      this.ttls.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  async ttl(key: string): Promise<number> {
    const expiry = this.ttls.get(key);
    if (!expiry) return -1;
    
    const ttl = Math.floor((expiry - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  async incr(key: string): Promise<number> {
    const value = parseInt(this.store.get(key) || '0');
    const newValue = value + 1;
    this.store.set(key, newValue);
    return newValue;
  }

  async decr(key: string): Promise<number> {
    const value = parseInt(this.store.get(key) || '0');
    const newValue = value - 1;
    this.store.set(key, newValue);
    return newValue;
  }

  async hset(key: string, field: string | Record<string, any>, value?: any): Promise<number> {
    let hash = this.store.get(key) || {};
    
    if (typeof field === 'object') {
      hash = { ...hash, ...field };
      this.store.set(key, hash);
      return Object.keys(field).length;
    } else {
      const isNew = !hash[field];
      hash[field] = value;
      this.store.set(key, hash);
      return isNew ? 1 : 0;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    const hash = this.store.get(key);
    return hash && hash[field] !== undefined ? String(hash[field]) : null;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const hash = this.store.get(key);
    if (!hash) return {};
    
    const result: Record<string, string> = {};
    for (const [field, value] of Object.entries(hash)) {
      result[field] = String(value);
    }
    return result;
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    const set = this.store.get(key) || new Set();
    let added = 0;
    
    for (const member of members) {
      if (!set.has(member)) {
        set.add(member);
        added++;
      }
    }
    
    this.store.set(key, set);
    return added;
  }

  async smembers(key: string): Promise<string[]> {
    const set = this.store.get(key);
    return set ? Array.from(set) : [];
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    const set = this.store.get(key);
    if (!set) return 0;
    
    let removed = 0;
    for (const member of members) {
      if (set.delete(member)) {
        removed++;
      }
    }
    
    return removed;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    this.ttls.clear();
    return 'OK';
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    return keys.map(key => {
      const value = this.store.get(key);
      return value !== undefined ? String(value) : null;
    });
  }

  async mset(...args: string[]): Promise<'OK'> {
    for (let i = 0; i < args.length; i += 2) {
      this.store.set(args[i], args[i + 1]);
    }
    return 'OK';
  }

  // Mock event emitter methods
  on(event: string, callback: Function): this {
    return this;
  }

  off(event: string, callback: Function): this {
    return this;
  }
}

export default Redis;