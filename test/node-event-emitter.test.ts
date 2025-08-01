import { describe, it, expect, beforeEach } from 'vitest';
import { NodeEventEmitterImpl } from '../src/providers/node';
import type { Event } from '../src/types';

// Test event interfaces
interface TestEvent extends Event {
  type: 'test.start' | 'test.end';
  data: string;
}

interface CounterEvent extends Event {
  type: 'counter.increment' | 'counter.reset';
  value: number;
}

describe('NodeEventEmitterImpl', () => {
  describe('Basic Functionality', () => {
    let emitter: NodeEventEmitterImpl<Event>;

    beforeEach(() => {
      emitter = new NodeEventEmitterImpl<Event>();
    });

    it('should create a NodeEventEmitterImpl instance', () => {
      expect(emitter).toBeDefined();
      expect(emitter.getNodeEmitter()).toBeDefined();
    });

    it('should handle event subscription and emission', () => {
      const receivedEvents: Event[] = [];
      
      const unsubscribe = emitter.on('basic.test', (event) => {
        receivedEvents.push(event);
      });

      emitter.emit({ type: 'basic.test' });
      emitter.emit({ type: 'basic.test' });

      expect(receivedEvents).toHaveLength(2);
      expect(receivedEvents[0].type).toBe('basic.test');
      
      unsubscribe();
      emitter.emit({ type: 'basic.test' });
      expect(receivedEvents).toHaveLength(2);
    });

    it('should handle typed events correctly', () => {
      const typedEmitter = new NodeEventEmitterImpl<TestEvent>();
      const receivedEvents: TestEvent[] = [];

      typedEmitter.on('test.start', (event) => {
        receivedEvents.push(event);
      });

      const testEvent: TestEvent = {
        type: 'test.start',
        data: 'initialization'
      };

      typedEmitter.emit(testEvent);

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].data).toBe('initialization');
      expect(receivedEvents[0].type).toBe('test.start');
    });

    it('should handle once() subscription correctly', () => {
      const receivedEvents: Event[] = [];
      
      emitter.once('once.test', (event) => {
        receivedEvents.push(event);
      });

      emitter.emit({ type: 'once.test' });
      emitter.emit({ type: 'once.test' });
      emitter.emit({ type: 'once.test' });

      expect(receivedEvents).toHaveLength(1);
    });

    it('should track listener counts correctly', () => {
      expect(emitter.listenerCount('count.test')).toBe(0);

      const unsub1 = emitter.on('count.test', () => {});
      expect(emitter.listenerCount('count.test')).toBe(1);

      const unsub2 = emitter.on('count.test', () => {});
      expect(emitter.listenerCount('count.test')).toBe(2);

      unsub1();
      expect(emitter.listenerCount('count.test')).toBe(1);

      unsub2();
      expect(emitter.listenerCount('count.test')).toBe(0);
    });

    it('should manage event types correctly', () => {
      expect(emitter.eventTypes()).toHaveLength(0);

      emitter.on('type1', () => {});
      emitter.on('type2', () => {});
      
      const types = emitter.eventTypes();
      expect(types).toContain('type1');
      expect(types).toContain('type2');
      expect(types).toHaveLength(2);
    });

    it('should handle off() to remove all listeners for a type', () => {
      emitter.on('remove.test', () => {});
      emitter.on('remove.test', () => {});
      
      expect(emitter.listenerCount('remove.test')).toBe(2);
      
      emitter.off('remove.test');
      
      expect(emitter.listenerCount('remove.test')).toBe(0);
    });

    it('should handle removeAllListeners()', () => {
      emitter.on('type1', () => {});
      emitter.on('type2', () => {});
      
      expect(emitter.eventTypes()).toHaveLength(2);
      
      emitter.removeAllListeners();
      
      expect(emitter.eventTypes()).toHaveLength(0);
    });

    it('should check for handlers correctly', () => {
      expect(emitter.hasHandlers('handler.test')).toBe(false);
      
      const unsub = emitter.on('handler.test', () => {});
      expect(emitter.hasHandlers('handler.test')).toBe(true);
      
      unsub();
      expect(emitter.hasHandlers('handler.test')).toBe(false);
    });
  });

  describe('Node.js Specific Features', () => {
    let emitter: NodeEventEmitterImpl<Event>;

    beforeEach(() => {
      emitter = new NodeEventEmitterImpl<Event>();
    });

    it('should provide access to underlying Node EventEmitter', () => {
      const nodeEmitter = emitter.getNodeEmitter();
      expect(nodeEmitter).toBeDefined();
      expect(typeof nodeEmitter.on).toBe('function');
      expect(typeof nodeEmitter.emit).toBe('function');
    });

    it('should work with Node EventEmitter directly', () => {
      const nodeEmitter = emitter.getNodeEmitter();
      const receivedEvents: Event[] = [];

      // Listen directly on Node emitter
      nodeEmitter.on('direct.test', (event: Event) => {
        receivedEvents.push(event);
      });

      // Emit through our wrapper
      emitter.emit({ type: 'direct.test' });

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].type).toBe('direct.test');
    });

    it('should handle high-volume events efficiently', () => {
      const receivedCount = { value: 0 };
      
      emitter.on('volume.test', () => {
        receivedCount.value++;
      });

      // Emit 1000 events
      for (let i = 0; i < 1000; i++) {
        emitter.emit({ type: 'volume.test' });
      }

      expect(receivedCount.value).toBe(1000);
    });
  });

  describe('Multiple Event Types', () => {
    it('should handle multiple event types with different schemas', () => {
      const emitter = new NodeEventEmitterImpl<TestEvent | CounterEvent>();
      
      const testEvents: TestEvent[] = [];
      const counterEvents: CounterEvent[] = [];
      
      emitter.on('test.start', (event) => {
        testEvents.push(event as TestEvent);
      });
      
      emitter.on('counter.increment', (event) => {
        counterEvents.push(event as CounterEvent);
      });
      
      emitter.emit({
        type: 'test.start',
        data: 'test data'
      } as TestEvent);
      
      emitter.emit({
        type: 'counter.increment',
        value: 42
      } as CounterEvent);
      
      expect(testEvents).toHaveLength(1);
      expect(counterEvents).toHaveLength(1);
      expect(testEvents[0].data).toBe('test data');
      expect(counterEvents[0].value).toBe(42);
    });
  });

  describe('Error Conditions', () => {
    let emitter: NodeEventEmitterImpl<Event>;

    beforeEach(() => {
      emitter = new NodeEventEmitterImpl<Event>();
    });

    it('should handle unsubscribe of non-existent listener gracefully', () => {
      expect(() => {
        const unsub = emitter.on('test', () => {});
        unsub();
        unsub(); // Should not throw on second call
      }).not.toThrow();
    });

    it('should handle off() on non-existent event type', () => {
      expect(() => {
        emitter.off('non.existent');
      }).not.toThrow();
    });

    it('should handle listenerCount on non-existent event type', () => {
      expect(emitter.listenerCount('non.existent')).toBe(0);
    });
  });

  describe('Memory Management', () => {
    let emitter: NodeEventEmitterImpl<Event>;

    beforeEach(() => {
      emitter = new NodeEventEmitterImpl<Event>();
    });

    it('should clean up listeners properly', () => {
      const listeners: (() => void)[] = [];

      // Add many listeners
      for (let i = 0; i < 100; i++) {
        const unsub = emitter.on(`test.${i}`, () => {});
        listeners.push(unsub);
      }

      expect(emitter.eventTypes()).toHaveLength(100);

      // Remove all listeners
      for (const unsub of listeners) {
        unsub();
      }

      expect(emitter.eventTypes()).toHaveLength(0);
    });

    it('should handle mixed add/remove operations', () => {
      let activeListeners = 0;

      for (let i = 0; i < 50; i++) {
        const unsub = emitter.on('mixed.test', () => {});
        activeListeners++;
        
        if (i % 3 === 0) {
          unsub();
          activeListeners--;
        }
      }

      expect(emitter.listenerCount('mixed.test')).toBe(activeListeners);
    });
  });
});
