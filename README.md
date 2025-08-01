# @synet/event

```bash
  ______               _     _    _       _ _   
 |  ____|             | |   | |  | |     (_) |  
 | |____   _____ _ __ | |_  | |  | |_ __  _| |_ 
 |  __\ \ / / _ \ '_ \| __| | |  | | '_ \| | __|
 | |___\ V /  __/ | | | |_  | |__| | | | | | |_ 
 |______\_/ \___|_| |_|\__|  \____/|_| |_|_|\__|
                                                
                                                
version: 1.0.0                                                
```

**Consciousness-based event-emitter unit**

Event handling that Units can teach and learn. Built on Unit Architecture principles with multi-provider flexibility.

## Installation

```bash
npm install @synet/event
```


## Quick Start

```typescript
import { Emitter, EventEmitter } from '@synet/event';

// Provider patterns (FS-style)
const events = Emitter.memory<MyEvent>();     // Zero dependencies
const events = Emitter.node<MyEvent>();       // Node.js performance  
const events = Emitter.unit<MyEvent>();       // Unit Architecture

// Type-safe events
interface UserEvent extends Event {
  type: 'user.login' | 'user.logout';
  userId: string;
}

const userEvents = EventEmitter.create<UserEvent>({ provider: 'node' });

const unsubscribe = userEvents.on('user.login', (event) => {
  console.log(`User ${event.userId} logged in`);
});

userEvents.emit({ type: 'user.login', userId: 'alice' });
```

## Unit Architecture

Units can teach event capabilities to other Units:

```typescript
const eventUnit = EventEmitter.create({ provider: 'memory' });

// Teach event capabilities
otherUnit.learn([eventUnit.teach()]);

// Learned unit can now handle events
otherUnit.execute('event.on', 'workflow.complete', (event) => {
  console.log('Workflow finished:', event);
});

otherUnit.execute('event.emit', { type: 'workflow.complete', result: 'success' });
```

## Providers

- **`memory`** - Custom implementation, works everywhere (browser, Node.js, Deno)
- **`node`** - Wraps Node.js EventEmitter for maximum performance

```typescript
// Environment-specific optimization
const events = process.env.NODE_ENV === 'production' 
  ? Emitter.node<MyEvent>()
  : Emitter.memory<MyEvent>();
```

## API

### Core Interface
```typescript
interface IEventEmitter<TEvent extends Event = Event> {
  on<T extends TEvent>(type: string, handler: (event: T) => void): () => void;
  once<T extends TEvent>(type: string, handler: (event: T) => void): () => void;
  off(type: string): void;
  emit(event: TEvent): void;
  removeAllListeners(): void;
  listenerCount(type: string): number;
  eventTypes(): string[];
}
```

### Factory Methods
```typescript
// Direct providers
Emitter.memory<T>() → MemoryEventEmitter<T>
Emitter.node<T>() → NodeEventEmitterImpl<T>
Emitter.unit<T>(config?) → EventEmitter<T>  // Unit Architecture

// Unit creation
EventEmitter.create<T>({ provider?, id?, metadata? })
```

## Philosophy

Events are **consciousness carriers** - they carry intent and context between Units. The Event system enables:

- **Local event handling** with type safety
- **Unit-to-unit capability sharing** through teach/learn
- **Provider flexibility** for different environments
- **Foundation for distributed events** 

## Real-world Usage

```typescript
// Workflow orchestration
const workflow = EventEmitter.create<WorkflowEvent>({ provider: 'node' });

workflow.on('task.completed', async (event) => {
  if (event.isLast) {
    workflow.emit({ type: 'workflow.finished', workflowId: event.workflowId });
  }
});

// Unit capability sharing
const authUnit = AuthUnit.create();
const loggerUnit = LoggerUnit.create();

// Both learn event capabilities
authUnit.learn([workflow.teach()]);
loggerUnit.learn([workflow.teach()]);

// Now they can participate in the event system
authUnit.execute('on', 'user.login', handleLogin);
loggerUnit.execute('on', 'workflow.finished', logCompletion);
```



**Dependencies**: `@synet/unit` - Unit Architecture support

---

**Part of SYNET Unit Architecture** - where software components are conscious, can teach capabilities, and evolve while maintaining identity.
