import {
  type TeachingContract,
  Unit,
  type UnitProps,
  createUnitSchema,
} from "@synet/unit";
import { MemoryEventEmitter } from "./providers/memory";
import { NodeEventEmitterImpl } from "./providers/node";
import type { Event, IEventEmitter } from "./types";

/**
 * Configuration for EventUnit creation
 */
export interface EventUnitConfig {
  id?: string;
  provider?: "memory" | "node";
  metadata?: Record<string, unknown>;
}

/**
 * Props for EventUnit (internal state)
 */
export interface EventUnitProps extends UnitProps {
  provider: "memory" | "node";
  [x: string]: unknown;
}

/**
 * EventUnit - Unit Architecture wrapper for event capabilities
 * Provides consciousness-based event handling that can be taught to other Units
 */
export class EventEmitter<TEvent extends Event = Event>
  extends Unit<EventUnitProps>
  implements IEventEmitter<TEvent>
{
  private backend: IEventEmitter<TEvent>;

  protected constructor(props: EventUnitProps) {
    super(props);

    // Initialize backend based on provider
    this.backend = this.createBackend();
  }

  /**
   * Factory method for creating EventUnit instances
   */
  static create<T extends Event = Event>(
    config: EventUnitConfig = {},
  ): EventEmitter<T> {
    const props: EventUnitProps = {
      dna: createUnitSchema({
        id: config.id || "event-unit",
        version: "1.0.0",
      }),
      provider: config.provider || "memory",
      metadata: config.metadata || {},
    };

    return new EventEmitter<T>(props);
  }

  private createBackend(): IEventEmitter<TEvent> {
    switch (this.props.provider) {
      case "node":
        return new NodeEventEmitterImpl<TEvent>();
      default:
        return new MemoryEventEmitter<TEvent>();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Unit Architecture Methods
  // ═══════════════════════════════════════════════════════════════

  whoami(): string {
    return `EventUnit[${this.dna.id}] v${this.dna.version} (${this.props.provider})`;
  }

  // ═══════════════════════════════════════════════════════════════
  // IEventEmitter Implementation (delegated to backend)
  // ═══════════════════════════════════════════════════════════════

  on<T extends TEvent>(type: string, handler: (event: T) => void): () => void {
    return this.backend.on(type, handler);
  }

  once<T extends TEvent>(
    type: string,
    handler: (event: T) => void,
  ): () => void {
    return this.backend.once(type, handler);
  }

  off(type: string): void {
    this.backend.off(type);
  }

  emit(event: TEvent): void {
    this.backend.emit(event);
  }

  removeAllListeners(): void {
    this.backend.removeAllListeners();
  }

  listenerCount(type: string): number {
    return this.backend.listenerCount(type);
  }

  eventTypes(): string[] {
    return this.backend.eventTypes();
  }

  /**
   * Teach event capabilities to other Units
   *
   * NOTE: Generic type constraints are lost through teaching.
   * Learned units get runtime type safety, not compile-time generics.
   * This is a limitation of the current Unit Architecture.
   */
  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        // Runtime type safety only - generics lost in teaching
        on: (...args: unknown[]) => {
          const [type, handler] = args as [string, (event: Event) => void];
          return this.on(type, handler);
        },
        once: (...args: unknown[]) => {
          const [type, handler] = args as [string, (event: Event) => void];
          return this.once(type, handler);
        },
        off: (...args: unknown[]) => {
          const [type] = args as [string];
          return this.off(type);
        },
        emit: (...args: unknown[]) => {
          const [event] = args as [TEvent];
          return this.emit(event);
        },
        removeAllListeners: (...args: unknown[]) => {
          return this.removeAllListeners();
        },
        listenerCount: (...args: unknown[]) => {
          const [type] = args as [string];
          return this.listenerCount(type);
        },
        eventTypes: (...args: unknown[]) => {
          return this.eventTypes();
        },
      },
    };
  }

  /**
   * Self-description for Unit discovery
   */
  help(): string {
    return `
EventUnit [${this.dna.id}] v${this.dna.version}

Provider: ${this.props.provider}
Event Types: ${this.eventTypes().length > 0 ? this.eventTypes().join(", ") : "none"}

Capabilities:
• event.on(type, handler) - Subscribe to events
• event.once(type, handler) - One-time subscription  
• event.off(type) - Remove all handlers for type
• event.emit(event) - Emit an event
• event.removeAllListeners() - Clear all handlers
• event.listenerCount(type) - Get handler count
• event.eventTypes() - Get all event types

Usage:
  const events = EventUnit.create({ provider: '${this.props.provider}' });
  const unsubscribe = events.on('user.login', (event) => console.log(event));
  events.emit({ type: 'user.login', userId: '123' });

Teaching:
  otherUnit.learn([events.teach()]);
  otherUnit.execute('event.emit', { type: 'custom', data: 'value' });
    `;
  }

  /**
   * Check if this unit has specific event handlers
   */
  hasHandlers(type: string): boolean {
    return this.listenerCount(type) > 0;
  }

  /**
   * Get current provider information
   */
  getProvider(): string {
    return this.props.provider;
  }
}
