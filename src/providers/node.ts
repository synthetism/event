import { EventEmitter as NodeEventEmitter } from "node:events";
import type { Event, IEventEmitter } from "../types";

/**
 * Node.js native EventEmitter implementation
 * Uses Node.js built-in EventEmitter for maximum performance and compatibility
 */
export class NodeEventEmitterImpl<TEvent extends Event = Event>
  implements IEventEmitter<TEvent>
{
  private emitter: NodeEventEmitter;

  constructor() {
    this.emitter = new NodeEventEmitter();
  }

  /**
   * Subscribe to events of a specific type with enhanced type safety
   */
  on<T extends TEvent>(type: string, handler: (event: T) => void): () => void {
    this.emitter.on(type, handler);

    // Return unsubscribe function
    return () => {
      this.emitter.off(type, handler);
    };
  }

  /**
   * One-time event subscription with enhanced type safety
   */
  once<T extends TEvent>(
    type: string,
    handler: (event: T) => void,
  ): () => void {
    this.emitter.once(type, handler);

    // Return unsubscribe function (in case they want to cancel before it fires)
    return () => {
      this.emitter.off(type, handler);
    };
  }

  /**
   * Remove all handlers for a specific event type
   */
  off(type: string): void {
    this.emitter.removeAllListeners(type);
  }

  /**
   * Emit an event to all subscribed handlers
   */
  emit(event: TEvent): void {
    this.emitter.emit(event.type, event);
  }

  /**
   * Remove all handlers for all event types
   */
  removeAllListeners(): void {
    this.emitter.removeAllListeners();
  }

  /**
   * Get count of handlers for an event type
   */
  listenerCount(type: string): number {
    return this.emitter.listenerCount(type);
  }

  /**
   * Get all active event types
   */
  eventTypes(): string[] {
    return this.emitter.eventNames() as string[];
  }

  /**
   * Check if there are any handlers for a specific event type
   */
  hasHandlers(type: string): boolean {
    return this.listenerCount(type) > 0;
  }

  /**
   * Get the underlying Node.js EventEmitter (for advanced usage)
   */
  getNodeEmitter(): NodeEventEmitter {
    return this.emitter;
  }
}
