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

export type { Event, IEventEmitter, EventObserver } from './types';
// Provider implementations
export { MemoryEventEmitter } from './memory-event-emitter';
export { NodeEventEmitterImpl } from './node-event-emitter';

// Unit Architecture
export { EventUnit } from './event-unit-new';
export type { EventUnitConfig, EventUnitProps } from './event-unit-new';

// Provider factory (FS pattern)
export { EventProvider, EventEmitter } from './providers';
