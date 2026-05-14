# Software Engineering Principles in Wahala Sorter

Building good software isn't just about making it work; it's about organizing the code so it's easy to read, fix, and expand later. Here are the core software engineering principles used in the Wahala Sorter codebase.

---

## 1. Separation of Concerns (SoC)
**What it means in plain words:** 
Don't mix different types of work in the same place. Keep your styling separate from your logic, your logic separate from your UI, and your data definitions separate from everything else. It's like having a kitchen for cooking and a bedroom for sleeping, instead of doing both in the same room.

**Where it appears:**
The entire folder structure is built on this principle.
- **Data Definitions:** `src/types/index.ts` only holds shapes of data.
- **Logic:** `src/hooks/useTasks.ts` only holds state management.
- **UI:** `src/components/` only holds visual elements.
- **Styling:** `src/styles/` only holds CSS.
- **Helpers:** `src/utils/time.ts` only holds standalone helper functions.

---

## 2. Single Responsibility Principle (SRP)
**What it means in plain words:** 
Every file, function, or component should do exactly one thing and have only one reason to change. If a component is responsible for too many things, a bug in one part might break the whole component.

**Where it appears:**
Every component does just one job:
- `src/components/Header.tsx` only renders the title. It doesn't fetch data or handle state.
- `src/components/AddTaskForm.tsx` is solely responsible for capturing user text and passing it up.
- `src/utils/time.ts` has a function that takes a number and returns a string. It doesn't care about React or tasks:
  ```typescript
  // src/utils/time.ts (Lines 1-8)
  export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  ```

---

## 3. Immutability
**What it means in plain words:** 
Once you create data, you never change it directly. If you need to update it, you create a brand new copy with the changes. This prevents weird bugs where data changes unexpectedly while the app is trying to read it.

**Where it appears:**
Whenever we update tasks, we never do `tasks.push(newTask)`. Instead, we create a new array containing all old tasks plus the new one.
- Adding a task:
  ```typescript
  // src/hooks/useTasks.ts (Line 15)
  setTasks((prev) => [...prev, newTask]);
  ```
- Deleting a task (creates a new array missing the deleted item):
  ```typescript
  // src/hooks/useTasks.ts (Line 19)
  setTasks((prev) => prev.filter((task) => task.id !== id));
  ```
- Moving a task during drag-and-drop:
  ```typescript
  // src/App.tsx (Line 60)
  const newTasks = [...tasks];
  newTasks[activeIndex].column = tasks[overIndex].column;
  ```

---

## 4. Composition
**What it means in plain words:** 
Building big, complex things by plugging together small, simple things. Instead of writing one massive file with thousands of lines of code for the whole app, you build tiny components and nest them inside each other.

**Where it appears:**
`App.tsx` acts as the master builder, composing the UI out of smaller building blocks (`Header`, `AddTaskForm`, `Column`).
```tsx
// src/App.tsx (Lines 89-106)
return (
  <>
    <Header />
    <AddTaskForm onAdd={addTask} />
    <DndContext ...>
      <div className="board">
        {COLUMNS.map((col) => (
          <Column ... />
        ))}
      </div>
    </DndContext>
  </>
);
```
Furthermore, `Column.tsx` itself composes multiple `TaskCard.tsx` components.

---

## 5. Encapsulation (Information Hiding)
**What it means in plain words:** 
Hiding the messy, complicated inner workings of a feature, and only giving the rest of the app a simple set of buttons to use. A TV hides its complicated wires; it just gives you a remote control.

**Where it appears:**
The `useTasks` hook hides *how* tasks are stored (using `useState`), generated, and deleted. `App.tsx` just asks for the remote control (`addTask`, `deleteTask`) and doesn't need to know how the wiring works.
```typescript
// src/App.tsx (Lines 22)
// App just consumes the simple interface:
const { tasks, setTasks, addTask, deleteTask } = useTasks([...]);
```

---

## 6. DRY (Don't Repeat Yourself)
**What it means in plain words:** 
If you find yourself writing the exact same code more than once, you should write it once and reuse it. This saves time and means if you need to fix a bug, you only have to fix it in one place.

**Where it appears:**
Instead of manually writing three separate column definitions (`<Column column="Now" />`, `<Column column="Soon" />`, `<Column column="Later" />`), the app loops over a single list of columns:
```tsx
// src/App.tsx (Lines 98-105)
{COLUMNS.map((col) => (
  <Column
    key={col}
    column={col}
    tasks={tasks.filter((t) => t.column === col)}
    onDeleteTask={deleteTask}
  />
))}
```
