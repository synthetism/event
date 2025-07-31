import { describe, it, expect } from 'vitest';
import { Emitter } from '../src/providers';
import type { Event } from '../src/types';

interface IntegrationEvent extends Event {
  type: 'integration.test' | 'integration.complete';
  payload: {
    id: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
  };
}

describe('Event Integration Tests', () => {
  describe('Provider Factory Pattern', () => {
    it('should create memory emitter through factory', () => {
      const emitter = Emitter.memory<IntegrationEvent>();
      expect(emitter).toBeDefined();
      
      const events: IntegrationEvent[] = [];
      emitter.on('integration.test', (event) => {
        events.push(event);
      });

      emitter.emit({
        type: 'integration.test',
        payload: {
          id: 'test-123',
          timestamp: new Date()
        }
      });

      expect(events).toHaveLength(1);
      expect(events[0].payload.id).toBe('test-123');
    });

    it('should create node emitter through factory', () => {
      const emitter = Emitter.node<IntegrationEvent>();
      expect(emitter).toBeDefined();
      
      const events: IntegrationEvent[] = [];
      emitter.on('integration.test', (event) => {
        events.push(event);
      });

      emitter.emit({
        type: 'integration.test',
        payload: {
          id: 'node-456',
          timestamp: new Date()
        }
      });

      expect(events).toHaveLength(1);
      expect(events[0].payload.id).toBe('node-456');
    });

    it('should create unit emitter through factory', () => {
      const emitter = Emitter.unit<IntegrationEvent>({ provider: 'memory' });
      expect(emitter).toBeDefined();
      expect(emitter.getProvider()).toBe('memory');
      
      const events: IntegrationEvent[] = [];
      emitter.on('integration.test', (event) => {
        events.push(event);
      });

      emitter.emit({
        type: 'integration.test',
        payload: {
          id: 'unit-789',
          timestamp: new Date()
        }
      });

      expect(events).toHaveLength(1);
      expect(events[0].payload.id).toBe('unit-789');
    });
  });

  describe('Cross-Provider Compatibility', () => {
    it('should handle same event types across different providers', () => {
      const memoryEmitter = Emitter.memory<IntegrationEvent>();
      const nodeEmitter = Emitter.node<IntegrationEvent>();
      const unitEmitter = Emitter.unit<IntegrationEvent>({ provider: 'node' });

      const allEvents: IntegrationEvent[] = [];

      // Set up listeners on all emitters
      memoryEmitter.on('integration.complete', (event) => {
        allEvents.push({ ...event, provider: 'memory' } as IntegrationEvent & { provider: string });
      });

      nodeEmitter.on('integration.complete', (event) => {
        allEvents.push({ ...event, provider: 'node' } as IntegrationEvent & { provider: string });
      });

      unitEmitter.on('integration.complete', (event) => {
        allEvents.push({ ...event, provider: 'unit' } as IntegrationEvent & { provider: string });
      });

      // Emit events on all emitters
      const testEvent: IntegrationEvent = {
        type: 'integration.complete',
        payload: {
          id: 'cross-test',
          timestamp: new Date(),
          metadata: { test: 'cross-provider' }
        }
      };

      memoryEmitter.emit(testEvent);
      nodeEmitter.emit(testEvent);
      unitEmitter.emit(testEvent);

      expect(allEvents).toHaveLength(3);
      expect(allEvents.every(event => event.payload.id === 'cross-test')).toBe(true);
    });
  });

  describe('Real-world Usage Patterns', () => {
    it('should support event-driven workflow', async () => {
      const workflowEmitter = Emitter.unit<IntegrationEvent>({ provider: 'memory' });
      const steps: string[] = [];

      // Set up workflow listeners
      workflowEmitter.on('integration.test', (event) => {
        steps.push(`Started: ${event.payload.id}`);
        
        // Simulate async work
        setTimeout(() => {
          workflowEmitter.emit({
            type: 'integration.complete',
            payload: {
              id: event.payload.id,
              timestamp: new Date(),
              metadata: { completed: true }
            }
          });
        }, 10);
      });

      workflowEmitter.on('integration.complete', (event) => {
        steps.push(`Completed: ${event.payload.id}`);
      });

      // Start workflow
      workflowEmitter.emit({
        type: 'integration.test',
        payload: {
          id: 'workflow-001',
          timestamp: new Date()
        }
      });

      // Wait for async completion
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(steps).toHaveLength(2);
      expect(steps[0]).toBe('Started: workflow-001');
      expect(steps[1]).toBe('Completed: workflow-001');
    });

    it('should handle unit teaching and learning', () => {
      const teacher = Emitter.unit<IntegrationEvent>({ provider: 'memory' });
      
      // Mock learner
      const learner = {
        _capabilities: new Map<string, (...args: unknown[]) => unknown>(),
        learn: function(contracts: Array<{ unitId: string; capabilities: Record<string, (...args: unknown[]) => unknown> }>) {
          for (const contract of contracts) {
            for (const [name, capability] of Object.entries(contract.capabilities)) {
              this._capabilities.set(name, capability);
            }
          }
        },
        execute: function(capability: string, ...args: unknown[]) {
          const fn = this._capabilities.get(capability);
          if (!fn) throw new Error(`Unknown capability: ${capability}`);
          return fn(...args);
        }
      };

      // Teaching/learning process
      learner.learn([teacher.teach()]);

      // Test learned capabilities
      const receivedEvents: IntegrationEvent[] = [];
      
      const unsubscribe = learner.execute('on', 'integration.test', (event: IntegrationEvent) => {
        receivedEvents.push(event);
      }) as () => void;

      learner.execute('emit', {
        type: 'integration.test',
        payload: {
          id: 'learned-event',
          timestamp: new Date()
        }
      });

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].payload.id).toBe('learned-event');

      unsubscribe();
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid event emission', () => {
      const emitter = Emitter.memory<IntegrationEvent>();
      let eventCount = 0;

      emitter.on('integration.test', () => {
        eventCount++;
      });

      // Emit 1000 events rapidly
      for (let i = 0; i < 1000; i++) {
        emitter.emit({
          type: 'integration.test',
          payload: {
            id: `rapid-${i}`,
            timestamp: new Date()
          }
        });
      }

      expect(eventCount).toBe(1000);
    });

    it('should handle cleanup properly', () => {
      const emitter = Emitter.unit<IntegrationEvent>({ provider: 'node' });
      const unsubscribers: (() => void)[] = [];

      // Add many listeners
      for (let i = 0; i < 100; i++) {
        const unsub = emitter.on('integration.test', () => {});
        unsubscribers.push(unsub);
      }

      expect(emitter.listenerCount('integration.test')).toBe(100);

      // Clean up all
      for (const unsub of unsubscribers) {
        unsub();
      }

      expect(emitter.listenerCount('integration.test')).toBe(0);
    });
  });
});
