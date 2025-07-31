import { EventEmitter } from "./event.unit";
import { MemoryEventEmitter } from "./memory-event-emitter";
import { NodeEventEmitterImpl } from "./node-event-emitter";
import type { Event } from "./types";

/**
 * Event provider factory - following the FS pattern
 * Provides different EventEmitter backends for different environments
 */
export const Emitter = {
  /**
   * Memory-based EventEmitter (custom implementation, zero dependencies)
   * Works in any environment: Node.js, browser, Deno, Cloudflare Workers
   */
  memory: <T extends Event = Event>() => new MemoryEventEmitter<T>(),

  /**
   * Node.js native EventEmitter (maximum performance and compatibility)
   * Only works in Node.js environments
   */
  node: <T extends Event = Event>() => new NodeEventEmitterImpl<T>(),

  /**
   * Unit Architecture wrapper with configurable backend
   * Can be taught to other Units, provides consciousness-based events
   */
  unit: <T extends Event = Event>(config?: { provider?: "memory" | "node" }) =>
    EventEmitter.create<T>(config),
} as const;

/**
 * Alternative naming for convenience
 * EventEmitter.memory() / EventEmitter.node() / EventEmitter.unit()
 */
