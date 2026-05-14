# Cross-Check Audit: Wahala Sorter

An independent third-party review of the Wahala Sorter codebase conducted on 2026-05-14. This audit supplements the existing docs (01-explanation, 02-principles, 03-audit) by uncovering issues those documents missed.

---

## 1. Immutability Violation in Drag Logic

**File:** `src/App.tsx:72-74`
```ts
const newTasks = [...tasks];
newTasks[activeIndex].column = tasks[overIndex].column;
return arrayMove(newTasks, activeIndex, overIndex);
```

**Issue:** `[...tasks]` is a shallow copy. `newTasks[activeIndex]` is still a reference to the same object in the previous state (`tasks[activeIndex]`). Mutating `newTasks[activeIndex].column` directly mutates a property on a state object, violating React's immutability contract. While React's shallow comparison won't detect this (the array reference changes via `arrayMove`), it is technically incorrect and can cause subtle bugs if external memoized selectors rely on task object identity.

**Fix:** Create a new task object instead of mutating in place:
```ts
const newTasks = tasks.map((t, i) =>
  i === activeIndex ? { ...t, column: tasks[overIndex].column as ColumnType } : t
);
return arrayMove(newTasks, activeIndex, overIndex);
```

---

## 2. Missing `@dnd-kit/core` as a Direct Dependency of `@dnd-kit/sortable`

**File:** `package.json:15`

`@dnd-kit/sortable@10.0.0` lists `@dnd-kit/core@^6.3.0` as a peer dependency. The installed `@dnd-kit/core@6.3.1` satisfies this, so the build succeeds. However, `@dnd-kit/utilities@3.2.2` is pinned to this exact version while `core` and `sortable` are on `^`. If a future install resolves `@dnd-kit/core` to `6.4.0` while `sortable` stays at `10.0.0`, the peer dep (`^6.3.0`) still passes, but `@dnd-kit/utilities@3.2.2` may not be forward-compatible with the newer core. No immediate breakage, but an ecosystem-lock risk.

**Recommendation:** Pin all three to compatible patch versions using `@dnd-kit/core@6.3.1`, `@dnd-kit/sortable@10.0.0`, `@dnd-kit/utilities@3.2.2` with exact (`--save-exact`) rather than ranges.

---

## 3. Column Accessible Name Missing

**File:** `src/components/Column.tsx:17-23`

```tsx
const { setNodeRef } = useDroppable({
  id: column,
  data: { type: 'Column', column },
});
```

The droppable region rendered as `.column-body` has no accessible name. Screen readers see a generic drop target without knowing which column ("Now", "Soon", "Later") it represents. The column header text is rendered in a sibling `<div>` (`column-header`) outside the droppable region.

**Fix:** Add `aria-label` to the droppable container:
```tsx
<div className="column-body" ref={setNodeRef} aria-label={`${column} column`}>
```

---

## 4. Delete Button Inaccessible on Touch Devices

**File:** `src/styles/task-card.css:59-61`
```css
.task-card:hover .delete-btn {
  opacity: 1;
}
```

The delete button starts at `opacity: 0` and only appears on `:hover`. On touch devices (phones, tablets), `:hover` is unreliable — it may fire once on tap or never fire after the first interaction. Users on mobile effectively cannot see or discover the delete button.

**Fix:** Use a media query to always show the delete button on touch devices:
```css
@media (hover: hover) {
  .task-card:hover .delete-btn {
    opacity: 1;
  }
}
@media (hover: none) {
  .delete-btn {
    opacity: 1;
  }
}
```

---

## 5. Header Uses Inline Styles, Inconsistent with Rest of Codebase

**File:** `src/components/Header.tsx:6-11`

```tsx
<header style={{ marginBottom: '2rem', textAlign: 'center' }}>
  <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', ... }}>
```

Every other component imports a CSS module or stylesheet. `Header.tsx` is the only component using inline styles. This makes the header's styling impossible to theme via CSS variables, hard to override, and inconsistent with the project's agreed-upon styling convention (per `DECISIONS.md`).

**Fix:** Move header styles to `global.css` or a dedicated CSS file.

---

## 6. No Keyboard Focus Indicators

**File:** `src/styles/*.css`

No CSS file defines `:focus-visible` or `:focus` styles for interactive elements (buttons, inputs, cards). Keyboard users tabbing through the app see no visual indicator of which element has focus. The previous audit (`03-audit.md`) covered screen reader labels but missed focus visibility.

**Fix:** Add to `global.css`:
```css
:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}
```

---

## 7. `crypto.randomUUID()` Availability Risk

**File:** `src/hooks/useTasks.ts:11`

```ts
id: crypto.randomUUID(),
```

`crypto.randomUUID()` is available in secure contexts (HTTPS) and in modern browsers. It works on `localhost` (treated as secure context by browsers). However, it will throw a `TypeError` in:
- Older browsers (Chrome < 92, Firefox < 95, Safari < 15.4)
- Non-secure contexts (HTTP on a network address)

This is an MVP risk — acceptable for now but should be documented or polyfilled before a public release.

**Mitigation:** Add a fallback:
```ts
const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
};
```

---

## 8. TypeScript Strict Mode Not Enabled

**File:** `tsconfig.app.json`

`"strict": true` is absent. This means `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and other critical checks are not enforced. The project is using TypeScript ~6.0.2 but not leveraging its full safety net.

**Verification:** The project built and type-checked without errors despite functions like `handleDragOver` using unguarded array indices (`tasks[activeIndex]` could be `undefined` if `findIndex` returns `-1`).

**Fix:** Add `"strict": true` to `compilerOptions` and resolve any resulting type errors.

---

## 9. Missing Error Boundaries

No React error boundary wraps the component tree. If `useTasks`, `DndContext`, or any child component throws during render, the entire app unmounts to a blank screen. Error boundaries cost ~10 lines of code and provide a fallback UI plus recovery mechanism.

---

## 10. Drag Edge Case: Dragging Task That Gets Deleted

If a user starts dragging a task and then (via keyboard shortcut or another browser tab) the task is deleted, `handleDragEnd` calls `setActiveTask(null)` but the `DragOverlay` still references the stale `activeTask` object. The app does not crash, but the ghost card persists until `handleDragEnd` fires. No guard exists to check whether the task still exists in state before rendering the overlay.

---

## 11. `arrayMove` Called with Same Indices (No-Op)

**File:** `src/App.tsx:87`
```ts
return arrayMove(newTasks, activeIndex, activeIndex);
```

When a task is dropped onto an empty column, `arrayMove` is called with identical source and destination indices. This produces a new array reference with the exact same element ordering — a no-op that triggers an unnecessary re-render of all columns. The column change is already applied via `newTasks[activeIndex].column = ...`, so the call to `arrayMove` serves no purpose.

**Fix:** Return `newTasks` directly instead of passing through `arrayMove`.

---

## 12. No Unit or Integration Tests

The project has zero tests and no testing dependencies in `package.json`. The `lint` script exists but no `test` script. Every aspect of the app (task CRUD, drag-and-drop reordering, column switching, time formatting) is untested. The drag-and-drop logic in `handleDragOver` is the most critical and error-prone code path and has no automated coverage.

---

## 13. `dist/` Files Present in Working Tree but Git-Ignored

The `dist/` directory exists on disk with a built bundle (`index.html`, CSS, JS) but `.gitignore` lists `dist`. This is not a git problem (it is properly ignored), but the stale build on disk could confuse contributors who modify source and expect `dist/` to reflect the latest code.

---

## 14. `erasableSyntaxOnly` Constraint

**File:** `tsconfig.app.json:21`, `tsconfig.node.json:20`
```json
"erasableSyntaxOnly": true
```

This TypeScript 6.x option disallows runtime-preserving syntax like `enum`, `namespace`, and parameter properties. The current codebase does not use any of these features, so constraining is safe. However, if any dependency uses enums, this could cause unexpected type errors. Worth documenting as a team constraint.

---

## Summary

| Severity | Issue | Area | Existing Docs Flagged? |
|----------|-------|------|------------------------|
| High | Immutability violation in `handleDragOver` | App.tsx:72-74 | No (03-audit missed) |
| Medium | Column droppable missing accessible name | Column.tsx | No |
| Medium | Delete button invisible on touch devices | task-card.css | No |
| Medium | No keyboard focus indicators | styles/*.css | No |
| Medium | TypeScript strict mode off | tsconfig.app.json | No |
| Medium | No error boundaries | App.tsx | No |
| Medium | No test infrastructure | package.json | No |
| Low | Inline styles in Header | Header.tsx | No |
| Low | `crypto.randomUUID()` availability risk | useTasks.ts | No |
| Low | Redundant `arrayMove` call | App.tsx:87 | No |
| Low | Drag-delete race condition | App.tsx / TaskCard.tsx | No |
| Info | Peer dependency range friction | package.json | No |
| Info | `erasableSyntaxOnly` constraint | tsconfig | No |
