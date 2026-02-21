---
name: modern-best-practice-react-component
description: Build clean, modern React components that apply common best practices to avoid unnecessary usages of useEffect. Use this skill whenever building React components, refactoring existing React code, reviewing React patterns, or when the user asks about state management, data fetching, derived state, or event handling in React. Also trigger when the user mentions hooks like useEffect, useMemo, useState, or asks how to structure a React component properly. Even if the user doesn't mention "best practices" explicitly, use this skill when writing any non-trivial React component to ensure clean, modern patterns are followed.
---

# Modern Best-Practice React Components

Build React components that are clean, predictable, and maintainable by defaulting to simpler patterns and treating `useEffect` as a last resort — not a first instinct.

## Core Philosophy

Most `useEffect` calls are a code smell. They introduce synchronization bugs, unnecessary re-renders, and make components harder to reason about. Before reaching for `useEffect`, ask: "Can I solve this without it?" The answer is usually yes.

## The useEffect Decision Framework

Only use `useEffect` when you genuinely need to **synchronize with an external system** (DOM APIs, browser events, third-party libraries, network subscriptions). For everything else, there's a better pattern.

### Pattern 1: Derived State — Just Calculate It

**Problem:** Using `useEffect` to "sync" state that's computable from other state or props.

```jsx
// BAD — unnecessary effect, extra render, potential bugs
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// GOOD — derive it during render
const fullName = `${firstName} ${lastName}`;
```

**Why it matters:** Every `setState` inside a `useEffect` causes an extra re-render. Derived values computed inline are always in sync — no timing issues, no stale state.

**When computation is expensive**, wrap it in `useMemo`:

```jsx
const sortedItems = useMemo(
  () => items.toSorted((a, b) => a.price - b.price),
  [items]
);
```

Only reach for `useMemo` when you've measured a performance problem or the computation is obviously heavy (sorting large arrays, complex filtering). Don't prematurely optimize.

### Pattern 2: Responding to Events — Use Event Handlers

**Problem:** Using `useEffect` to react to user actions.

```jsx
// BAD — useEffect to respond to a form submission
useEffect(() => {
  if (submitted) {
    sendAnalytics({ action: 'submit', formId });
  }
}, [submitted]);

// GOOD — handle it in the event handler where the action happens
function handleSubmit() {
  postForm(formData);
  sendAnalytics({ action: 'submit', formId });
}
```

**Principle:** If something happens *because the user did something*, it belongs in an event handler. If something happens *because the component is visible on screen*, it might belong in an effect.

### Pattern 3: Resetting State on Prop Change — Use a Key

**Problem:** Using `useEffect` to reset internal state when a prop changes.

```jsx
// BAD — effect to reset state when userId changes
useEffect(() => {
  setComment('');
  setEditMode(false);
}, [userId]);

// GOOD — use a key to remount cleanly
<CommentForm key={userId} userId={userId} />
```

**Why it works:** React destroys and recreates the component when the key changes, giving you a fresh instance with clean initial state. This is declarative and eliminates an entire class of bugs where stale state leaks between entities.

### Pattern 4: Data Fetching — Use a Framework or Library

**Problem:** Writing fetch-in-useEffect by hand.

```jsx
// BAD — manual fetch with effect
useEffect(() => {
  let cancelled = false;
  fetch(`/api/user/${id}`)
    .then(res => res.json())
    .then(data => {
      if (!cancelled) setUser(data);
    });
  return () => { cancelled = true; };
}, [id]);

// GOOD — use a purpose-built solution
// React 19: use() with Suspense
const user = use(fetchUser(id));

// TanStack Query
const { data: user } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
});

// Next.js / Remix: load data in server components or loaders
```

**Why it matters:** Hand-rolled fetch effects don't handle race conditions, caching, deduplication, or background revalidation. Libraries solve all of these. If you must fetch in an effect (no framework, no library), always implement a cleanup function to avoid race conditions.

### Pattern 5: Initializing Once — Use Lazy Initialization or Module Scope

**Problem:** Using `useEffect` to run something once on mount.

```jsx
// BAD
useEffect(() => {
  analytics.init();
}, []);

// GOOD — lazy state initializer (for state)
const [store] = useState(() => createStore());

// GOOD — module scope (for singletons)
const analytics = initAnalytics(); // runs once at import time

// GOOD — ref guard (when you truly need "once per mount" with a side effect)
const initialized = useRef(false);
if (!initialized.current) {
  initialized.current = true;
  doSomethingOnce();
}
```

### Pattern 6: Communicating with Parent — Call Callbacks Directly

**Problem:** Using `useEffect` to notify a parent of state changes.

```jsx
// BAD — effect to "push" state up
useEffect(() => {
  onChange(internalValue);
}, [internalValue]);

// GOOD — call the callback where the change happens
function handleChange(newValue) {
  setInternalValue(newValue);
  onChange(newValue);
}
```

Cascading state updates through effects create unpredictable render chains. Keep the data flow explicit.

## Legitimate Uses of useEffect

These are the cases where `useEffect` is the right tool:

- **Subscriptions to external stores** (WebSocket, resize observer, intersection observer, media queries). Prefer `useSyncExternalStore` when subscribing to a shared external store.
- **DOM measurement and manipulation** (reading layout, focusing elements after render, integrating non-React DOM libraries).
- **Global event listeners** (keyboard shortcuts, online/offline, scroll position).
- **Cleanup on unmount** (timers, subscriptions, abort controllers).

Even for these, prefer a custom hook that encapsulates the effect so components stay clean:

```jsx
// Encapsulate the effect
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}

// Component stays effect-free
function Header() {
  const { width } = useWindowSize();
  return width < 768 ? <MobileNav /> : <DesktopNav />;
}
```

## Modern React (v18+/v19) Patterns to Prefer

- **React 19's `use()` hook** for reading promises and context — cleaner than `useEffect` + `useState` for async data.
- **Server Components** for data loading — move fetching out of client components entirely when possible.
- **`useActionState`** (React 19) for form mutations with pending/error states.
- **`useOptimistic`** (React 19) for optimistic UI updates without manual effect-based rollback.
- **`useSyncExternalStore`** for subscribing to external state (browser APIs, third-party stores) — provides automatic consistency guarantees that a raw `useEffect` subscription doesn't.

## Component Structure Checklist

When building or reviewing a component, verify:

1. **No derived state in `useState`** — if it can be computed from props or other state, compute it inline or with `useMemo`.
2. **No `useEffect` for event responses** — event handlers handle events.
3. **No `useEffect` for state resets** — use `key` to remount.
4. **No hand-rolled fetch effects** — use a data fetching library or framework.
5. **No `useEffect` chains** — if effect A triggers state that triggers effect B, refactor to a single event handler or reducer.
6. **Custom hooks encapsulate necessary effects** — components themselves should ideally have zero `useEffect` calls.
7. **Cleanup functions exist** for every effect that creates subscriptions, timers, or listeners.

## Quick Reference

| Instead of...                          | Do this...                              |
|----------------------------------------|------------------------------------------|
| `useEffect` + `setState` for derived data | Compute inline or `useMemo`           |
| `useEffect` to respond to user action  | Event handler                            |
| `useEffect` to reset state on prop change | `key` prop on the component           |
| `useEffect` for data fetching          | TanStack Query, SWR, `use()`, or loaders |
| `useEffect(fn, [])` for init           | Lazy `useState`, module scope, or ref   |
| `useEffect` to notify parent           | Call callback in event handler           |
| `useEffect` to subscribe to external store | `useSyncExternalStore`              |