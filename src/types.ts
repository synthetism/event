/**
 * Interface for events that can be emitted
 * This interface can be extended to create specific event types
 * with additional properties as needed.
 */

export interface Event {
  type: string;
}

/**
 * Interface for observer objects that want to be notified of specific events
 */
export interface EventObserver<T extends Event> {
  update(event: T): void;
}

/**
 * Interface for event emitters - provider-agnostic contract
 * Allows different backends (Node.js, memory, Deno, etc.)
 */
export interface IEventEmitter<TEvent extends Event = Event> {
  on<T extends TEvent>(type: string, handler: (event: T) => void): () => void;
  once<T extends TEvent>(type: string, handler: (event: T) => void): () => void;
  off(type: string): void;
  emit(event: TEvent): void;
  removeAllListeners(): void;
  listenerCount(type: string): number;
  eventTypes(): string[];
}
