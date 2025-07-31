import { describe, it, expect, beforeEach } from 'vitest';
import { EventEmitter } from '../src/event.unit';
import type { Event } from '../src/types';
import type { TeachingContract } from '@synet/unit';

// Test event interfaces
interface UserEvent extends Event {
  type: 'user.login' | 'user.logout';
  userId: string;
  timestamp: Date;
}

interface SystemEvent extends Event {
  type: 'system.start' | 'system.stop';
  processId: number;
}

describe('EventEmitter (EventUnit)', () => {
  describe('Memory Provider', () => {
    let events: EventEmitter<Event>;

    beforeEach(() => {
      events = EventEmitter.create({ provider: 'memory' });
    });

    it('should create an EventEmitter with memory provider', () => {
      expect(events).toBeDefined();
      expect(events.getProvider()).toBe('memory');
      expect(events.whoami()).toContain('EventUnit');
      expect(events.whoami()).toContain('memory');
    });

    it('should handle basic event subscription and emission', () => {
      const receivedEvents: Event[] = [];
      
      const unsubscribe = events.on('test.event', (event) => {
        receivedEvents.push(event);
      });

      events.emit({ type: 'test.event' });
      events.emit({ type: 'test.event' });

      expect(receivedEvents).toHaveLength(2);
      expect(receivedEvents[0].type).toBe('test.event');
      
      unsubscribe();
      events.emit({ type: 'test.event' });
      expect(receivedEvents).toHaveLength(2);
    });

    it('should handle typed events with custom properties', () => {
      const userEvents = EventEmitter.create<UserEvent>({ provider: 'memory' });
      const receivedEvents: UserEvent[] = [];

      userEvents.on('user.login', (event) => {
        receivedEvents.push(event);
      });

      const loginEvent: UserEvent = {
        type: 'user.login',
        userId: 'user123',
        timestamp: new Date()
      };

      userEvents.emit(loginEvent);

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].userId).toBe('user123');
      expect(receivedEvents[0].type).toBe('user.login');
    });

    it('should handle once() subscription correctly', () => {
      const receivedEvents: Event[] = [];
      
      events.once('once.event', (event) => {
        receivedEvents.push(event);
      });

      events.emit({ type: 'once.event' });
      events.emit({ type: 'once.event' });
      events.emit({ type: 'once.event' });

      expect(receivedEvents).toHaveLength(1);
    });

    it('should track listener counts correctly', () => {
      expect(events.listenerCount('test')).toBe(0);

      const unsub1 = events.on('test', () => {});
      expect(events.listenerCount('test')).toBe(1);

      const unsub2 = events.on('test', () => {});
      expect(events.listenerCount('test')).toBe(2);

      unsub1();
      expect(events.listenerCount('test')).toBe(1);

      unsub2();
      expect(events.listenerCount('test')).toBe(0);
    });

    it('should manage event types correctly', () => {
      expect(events.eventTypes()).toHaveLength(0);

      events.on('type1', () => {});
      events.on('type2', () => {});
      
      const types = events.eventTypes();
      expect(types).toContain('type1');
      expect(types).toContain('type2');
      expect(types).toHaveLength(2);
    });

    it('should handle off() to remove all listeners for a type', () => {
      events.on('remove.test', () => {});
      events.on('remove.test', () => {});
      
      expect(events.listenerCount('remove.test')).toBe(2);
      
      events.off('remove.test');
      
      expect(events.listenerCount('remove.test')).toBe(0);
    });

    it('should handle removeAllListeners()', () => {
      events.on('type1', () => {});
      events.on('type2', () => {});
      
      expect(events.eventTypes()).toHaveLength(2);
      
      events.removeAllListeners();
      
      expect(events.eventTypes()).toHaveLength(0);
    });

    it('should check for handlers correctly', () => {
      expect(events.hasHandlers('test')).toBe(false);
      
      const unsub = events.on('test', () => {});
      expect(events.hasHandlers('test')).toBe(true);
      
      unsub();
      expect(events.hasHandlers('test')).toBe(false);
    });
  });

  describe('Node Provider', () => {
    let events: EventEmitter<Event>;

    beforeEach(() => {
      events = EventEmitter.create({ provider: 'node' });
    });

    it('should create an EventEmitter with Node provider', () => {
      expect(events).toBeDefined();
      expect(events.getProvider()).toBe('node');
      expect(events.whoami()).toContain('node');
    });

    it('should handle basic event operations with Node backend', () => {
      const receivedEvents: Event[] = [];
      
      const unsubscribe = events.on('node.test', (event) => {
        receivedEvents.push(event);
      });

      events.emit({ type: 'node.test' });

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].type).toBe('node.test');
      
      unsubscribe();
      events.emit({ type: 'node.test' });
      expect(receivedEvents).toHaveLength(1);
    });

    it('should work with typed events on Node backend', () => {
      const systemEvents = EventEmitter.create<SystemEvent>({ provider: 'node' });
      const receivedEvents: SystemEvent[] = [];

      systemEvents.on('system.start', (event) => {
        receivedEvents.push(event);
      });

      const startEvent: SystemEvent = {
        type: 'system.start',
        processId: 12345
      };

      systemEvents.emit(startEvent);

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].processId).toBe(12345);
    });
  });

  describe('Unit Architecture Teaching', () => {
    let teacher: EventEmitter<Event>;
    let learner: {
      _capabilities: Map<string, (...args: unknown[]) => unknown>;
      learn: (contracts: TeachingContract[]) => void;
      execute: (capability: string, ...args: unknown[]) => unknown;
      can: (capability: string) => boolean;
    };

    beforeEach(() => {
      teacher = EventEmitter.create({ provider: 'memory' });
      
      // Mock learner with capabilities map and execute method
      learner = {
        _capabilities: new Map(),
        learn: (contracts: TeachingContract[]) => {
          for (const contract of contracts) {
            for (const [name, capability] of Object.entries(contract.capabilities)) {
              learner._capabilities.set(name, capability);
            }
          }
        },
        execute: (capability: string, ...args: unknown[]) => {
          const fn = learner._capabilities.get(capability);
          if (!fn) throw new Error(`Unknown capability: ${capability}`);
          return fn(...args);
        },
        can: (capability: string) => learner._capabilities.has(capability)
      };
    });

    it('should teach event capabilities to other units', () => {
      const contract = teacher.teach();
      
      expect(contract.unitId).toBe(teacher.dna.id);
      expect(contract.capabilities).toHaveProperty('on');
      expect(contract.capabilities).toHaveProperty('emit');
      expect(contract.capabilities).toHaveProperty('once');
      expect(contract.capabilities).toHaveProperty('off');
    });

    it('should allow learned units to use event capabilities', () => {
      // Learner learns from teacher
      learner.learn([teacher.teach()]);
      
      expect(learner.can('on')).toBe(true);
      expect(learner.can('emit')).toBe(true);
      
      // Test learned capabilities
      const receivedEvents: Event[] = [];
      
      const unsubscribe = learner.execute('on', 'learned.event', (event: Event) => {
        receivedEvents.push(event);
      }) as () => void;
      
      learner.execute('emit', { type: 'learned.event', data: 'test' });
      
      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].type).toBe('learned.event');
      
      unsubscribe();
      learner.execute('emit', { type: 'learned.event', data: 'test2' });
      expect(receivedEvents).toHaveLength(1);
    });

    it('should provide helpful documentation', () => {
      const help = teacher.help();
      
      expect(help).toContain('EventUnit');
      expect(help).toContain('event.on');
      expect(help).toContain('event.emit');
      expect(help).toContain('Usage:');
      expect(help).toContain('Teaching:');
    });
  });

  describe('Multiple Event Types', () => {
    it('should handle multiple event types simultaneously', () => {
      const events = EventEmitter.create<UserEvent | SystemEvent>({ provider: 'memory' });
      
      const userEvents: UserEvent[] = [];
      const systemEvents: SystemEvent[] = [];
      
      events.on('user.login', (event) => {
        userEvents.push(event as UserEvent);
      });
      
      events.on('system.start', (event) => {
        systemEvents.push(event as SystemEvent);
      });
      
      events.emit({
        type: 'user.login',
        userId: 'user123',
        timestamp: new Date()
      } as UserEvent);
      
      events.emit({
        type: 'system.start',
        processId: 99999
      } as SystemEvent);
      
      expect(userEvents).toHaveLength(1);
      expect(systemEvents).toHaveLength(1);
      expect(userEvents[0].userId).toBe('user123');
      expect(systemEvents[0].processId).toBe(99999);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid event types gracefully', () => {
      const events = EventEmitter.create({ provider: 'memory' });
      
      // This should not throw - we accept runtime flexibility
      expect(() => {
        events.emit({ type: 'unknown.event', customProp: 'value' } as Event & { customProp: string });
      }).not.toThrow();
    });
  });
});
