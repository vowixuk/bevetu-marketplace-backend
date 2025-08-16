import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { stripeWebhookEventKey } from './stripe.cache-key';

@Injectable()
export class StripeCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getEventId(eventId: string) {
    const key = stripeWebhookEventKey(eventId);
    const result = await this.cacheManager.get(key);
    if (result !== '1') {
      return false;
    }
    return true;
  }

  async setEventId(eventId: string, ttl: number = 50000): Promise<void> {
    const key = stripeWebhookEventKey(eventId);
    const value = '1';
    await this.cacheManager.set(key, value, ttl);
  }
}
