# Decisions

This document records the architectural and design decisions made while building Wahala Sorter.

## State Management
- **Decision:** In-memory state via React's `useState` for the MVP.
- **Reason:** The goal is to build a fast, useful prototype. Adding complex global state or a backend at this stage would slow down development without adding immediate value. State management is encapsulated in the `useTasks` hook for easy migration later.

## Drag and Drop
- **Decision:** Used `@dnd-kit/core` instead of native HTML5 drag API.
- **Reason:** Native HTML5 drag and drop is notoriously difficult to style and manage correctly across different devices and browsers. `@dnd-kit` provides a robust, accessible, and lightweight foundation tailored for modern React applications.

## Styling
- **Decision:** Vanilla CSS with a global reset and modular stylesheets.
- **Reason:** To adhere to the requirement of "flat design with a calm, focused color palette" and to keep the bundle size small. Avoiding CSS-in-JS or utility frameworks (unless requested) ensures full control over the aesthetic.

## Tooling
- **Decision:** Vite + React + TypeScript.
- **Reason:** Vite provides incredibly fast HMR, and TypeScript ensures robust type checking, especially useful when dealing with data structures for tasks and drag-and-drop events.
