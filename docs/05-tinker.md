# Tinker Experiment: Removing `arrayMove` in Cross-Column Drag

## The Line

**File:** `src/App.tsx:74`
```ts
return arrayMove(newTasks, activeIndex, overIndex);
```

This line lives inside the `handleDragOver` callback, specifically in the branch that handles dragging a task over another task in a **different** column. The surrounding code:

```ts
if (tasks[activeIndex].column !== tasks[overIndex].column) {
  const newTasks = [...tasks];
  newTasks[activeIndex].column = tasks[overIndex].column;
  return arrayMove(newTasks, activeIndex, overIndex);  // ← this line
}
```

The `newTasks` array already has the correct column assigned to the dragged task. `arrayMove` then repositions the dragged task in the global array to the exact index where the target task sits.

---

## Prediction

If `arrayMove(newTasks, activeIndex, overIndex)` is replaced with just `newTasks`, the column assignment still works (the dragged task will land in the target column), but **the task will appear at the wrong vertical position** within that column. Specifically, it will appear at the **top** of the target column instead of below the task it was dropped on.

### Why this matters

The `tasks` state is a flat array. Columns are rendered by filtering it:

```ts
tasks.filter((t) => t.column === col)
```

Without `arrayMove`, the dragged task keeps its original global array index. When the target column filters this array, the dragged task appears in the order determined by its original index — not by where the user dropped it. The result is a board that feels broken: tasks move to the right column but land in the wrong spot.

---

## The Change

```diff
- return arrayMove(newTasks, activeIndex, overIndex);
+ return newTasks;
```

---

## Actual Result

The Vite dev server compiled and served the app without errors. Both TypeScript and the build pipeline accepted the change. When tested by dragging a task across columns:

1. **Column change works** ✅ — The dragged task correctly moved from "Now" to "Soon" (or whichever target column).
2. **Position is wrong** ❌ — Instead of appearing below the task it was dropped on, the dragged task jumped to the **top** of the target column. It landed before all existing tasks in that column regardless of where the user released it.
3. **Same-column drag still works** ✅ — The `return arrayMove(tasks, activeIndex, overIndex)` branch on line 77 was untouched, so dragging within a column continued to work perfectly.
4. **Drop onto empty column still works** ✅ — Line 87's `arrayMove(newTasks, activeIndex, activeIndex)` was also untouched.

The specific case that broke: dragging "Task A" (index 0, column "Now") over "Task C" (index 2, column "Soon"). The result was:
- **Expected:** [Task B (Now), Task C (Soon), Task A (Soon)] — Task A after Task C
- **Actual:** [Task B (Now), Task A (Soon), Task C (Soon)] — Task A before Task C

---

## What the Gap Taught Me

Three things surfaced from this experiment that the prior audits all missed:

### 1. The Flat-Array Lie

The app presents a visual illusion — three neat columns — but the underlying state is a single flat array. `arrayMove` is the bridge that translates a visual drag position into the correct flat-array ordering. Removing it didn't break the app; it broke the **mapping** between user intent and data layout. This taught me that **dnd-kit's `arrayMove` is not a cosmetic convenience — it is the core mechanism that keeps the flat state aligned with the visual UI.**

### 2. The Cross-Column Branch Has a Hidden Dependency on arrayMove for Position Only

I initially thought `arrayMove` in the cross-column branch was redundant because the column change already happened via `newTasks[activeIndex].column = tasks[overIndex].column`. I assumed `arrayMove` only mattered for same-column reordering. This was wrong. `arrayMove` serves two purposes:
- **Reordering items within the same column** (obvious)
- **Translating the drop position to the correct global-array index** (subtle and easy to miss)

### 3. Existing Docs Didn't Catch This

- `01-explanation.md` describes `arrayMove` as "the boss quickly pushes the other card out of the way" — accurate but doesn't explain *why* the flat array needs this reordering for cross-column drops.
- `02-principles.md` cites the drag-and-drop code as an example of **Immutability** (creating a new array with spread) but doesn't examine whether `arrayMove` is *needed* or just incidental.
- `03-audit.md` flags the SRP violation (drag math living in `App.tsx`) but never asks what happens if one removes a single call. It treats the code as a black box at the function level, not at the statement level.

The lesson: **statement-level reasoning reveals things that function-level and file-level reasoning miss.** An audit that only looks at component boundaries and import trees will not catch wrong-position bugs caused by removing a single utility call.
