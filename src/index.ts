/**
 * @synet/event - Event Sourcing Made Simple
 *
 * Foundation of SYNET consciousness-based event architecture.
 * Bridges local EventEmitter pattern with Unit Architecture.
 *
 * Core Philosophy:
 * - Events are consciousness carriers (intent + context)
 * - Units naturally emit and respond to events
 * - Simple interface, powerful capabilities
 * - Foundation for distributed event systems
 */

// Event Unit (Unit Architecture + EventEmitter)
// Core interfaces and types

export type { Event, IEventEmitter, EventObserver } from "./types";
// Provider implementations
export { MemoryEventEmitter } from "./memory-event-emitter";
export { NodeEventEmitterImpl } from "./node-event-emitter";

// Unit Architecture
export { EventEmitter } from "./event.unit";
export type { EventUnitConfig, EventUnitProps } from "./event.unit";

// Provider factory (FS pattern)
export { Emitter } from "./providers";
