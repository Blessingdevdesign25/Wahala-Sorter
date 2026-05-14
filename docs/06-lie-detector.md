# Lie Detector: Five Statements About Wahala Sorter

An independent forensic examination of five claims about the codebase. Four are true, one is false.

---

## The Five Statements

**Statement A:** The `useTasks` hook (in `src/hooks/useTasks.ts`) uses `crypto.randomUUID()` for generating task IDs.

**Statement B:** The `formatTimestamp` function in `src/utils/time.ts` returns times in 12-hour format (e.g., "10:45 AM").

**Statement C:** The `PointerSensor` in `App.tsx` has an `activationConstraint` that requires a minimum drag distance of **10 pixels** before the drag starts.

**Statement D:** The `DragOverlay` component in `App.tsx` renders a `TaskCard` with `onDelete` set to an empty arrow function `() => {}`.

**Statement E:** The `Column` component uses both `useDroppable` (from `@dnd-kit/core`) and `SortableContext` (from `@dnd-kit/sortable`).

---

## Investigation

Each statement was checked against the source code line by line.

### Statement A — Verified `src/hooks/useTasks.ts`

```ts
// line 11
id: crypto.randomUUID(),
```

The code literally calls `crypto.randomUUID()` to assign each new task its ID. No alternative ID scheme exists in the file.

**Verdict:** TRUE ✅

### Statement B — Verified `src/utils/time.ts`

```ts
// lines 5-8
return date.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});
```

`hour12: true` forces 12-hour formatting. The function returns strings like "10:45 AM" or "2:30 PM" as confirmed by the comment on line 4.

**Verdict:** TRUE ✅

### Statement C — Verified `src/App.tsx`

```ts
// lines 32-35
useSensor(PointerSensor, {
  activationConstraint: {
    distance: 5,
  },
}),
```

The claim says the minimum drag distance is **10 pixels**. The actual source code says **5 pixels**.

This is the definitive mismatch.

**Verdict:** FALSE ❌ — **this is the lie.**

### Statement D — Verified `src/App.tsx`

```ts
// line 120
<TaskCard task={activeTask} onDelete={() => {}} />
```

The `DragOverlay` passes `onDelete={() => {}}` — a no-op arrow function that discards the call. Intended behavior: the ghost card shouldn't trigger deletion.

**Verdict:** TRUE ✅

### Statement E — Verified `src/components/Column.tsx`

```ts
// line 2: import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
// line 3: import { useDroppable } from '@dnd-kit/core';
// line 17: const { setNodeRef } = useDroppable({ ... });
// line 32: <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
```

The Column component imports and uses both hooks — `useDroppable` to mark itself as a drop target, and `SortableContext` to order its children.

**Verdict:** TRUE ✅

---

## The Reveal

**The lie is Statement C.**

The codebase uses `distance: 5` (5 pixels of mouse movement to activate a drag), not `distance: 10` as the statement claimed. Every other statement matches the source code exactly.

| Statement | Claimed Fact | Actual Source | Truth |
|-----------|-------------|---------------|-------|
| A | `crypto.randomUUID()` for IDs | Line 11, useTasks.ts | TRUE |
| B | 12-hour time format | `hour12: true`, time.ts | TRUE |
| C | **10px drag threshold** | **`distance: 5`**, App.tsx:34 | **FALSE** |
| D | `onDelete={() => {}}` in overlay | Line 120, App.tsx | TRUE |
| E | Uses `useDroppable` + `SortableContext` | Lines 2-3, 17, 32, Column.tsx | TRUE |

### What This Checks

Cross-referencing a specific numeric parameter against line-level source code catches lies that function-level or file-level reasoning would miss. A reviewer who only read the component names without looking at configuration objects would miss this discrepancy entirely.
