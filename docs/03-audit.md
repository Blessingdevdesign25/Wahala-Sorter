# The Wahala Sorter Audit: What We Missed

Hey there! Building software is a journey. When we first build a prototype like Wahala Sorter, we focus on getting it to work. But once it works, we have to put on our inspector hats and ask: *Is it fast? Is it safe? Can everyone use it?*

Let's walk through the codebase together and look at a few places where we cut corners, why those corners matter, and exactly how we can fix them.

---

## 1. Accessibility (a11y) Misses

Accessibility isn't a "nice to have"; it's a requirement. We want every builder in Lagos to use this app, including those using screen readers.

### The Missing Label Trap
Look at `AddTaskForm.tsx`:
```tsx
<input
  type="text"
  className="add-input"
  placeholder="What's the next wahala?"
  value={title}
  // ...
/>
```
**The Issue:** We used a `placeholder` to tell the user what to do, but placeholders often disappear when you start typing, and screen readers don't always read them aloud. 
**The Fix:** Every input needs a label. We can add a visually hidden label so it doesn't break our beautiful flat design, but screen readers can still find it.
```tsx
<label htmlFor="task-input" className="sr-only">New Task</label>
<input id="task-input" type="text" ... />
```

### The Silent Button
Look at the delete button in `TaskCard.tsx`:
```tsx
<button onClick={...} title="Delete task">
  <svg>...</svg>
</button>
```
**The Issue:** While `title` gives a nice hover tooltip for mouse users, a screen reader navigating through buttons just hears "Button". It doesn't know *what* the button does because there is no text inside it.
**The Fix:** Add an `aria-label` to explicitly tell assistive technologies what this button does.
```tsx
<button aria-label="Delete this task" onClick={...}>
```

---

## 2. Performance Traps

React is fast, but it only stays fast if we don't make it do unnecessary math. 

### The Filter-in-Render Trap
Look at `App.tsx` where we render our columns:
```tsx
{COLUMNS.map((col) => (
  <Column
    key={col}
    column={col}
    tasks={tasks.filter((t) => t.column === col)} // <--- Look here!
  />
))}
```
**The Issue:** Every time you type a single letter in the Add Task input, React re-renders `App.tsx`. And every time it re-renders, it runs that `.filter()` array method three times. Right now, with 3 tasks, it's instant. With 3,000 tasks, the app will start freezing every time you type.
**The Fix:** We should group the tasks once, and memorize that grouping using `useMemo` so React doesn't recalculate it unless the `tasks` array actually changes.
```tsx
// Inside App.tsx
const tasksByColumn = useMemo(() => {
  return tasks.reduce((acc, task) => {
    if (!acc[task.column]) acc[task.column] = [];
    acc[task.column].push(task);
    return acc;
  }, {} as Record<ColumnType, Task[]>);
}, [tasks]);

// Then later:
<Column tasks={tasksByColumn[col] || []} />
```

---

## 3. Violated Engineering Principles

We talked about the Single Responsibility Principle (SRP) earlier. Let's see where we broke our own rules.

### The Leaky Brain (Coupling Logic to UI)
Look at `handleDragOver` inside `App.tsx`. 
```tsx
// App.tsx
setTasks((tasks) => {
  const activeIndex = tasks.findIndex((t) => t.id === activeId);
  const overIndex = tasks.findIndex((t) => t.id === overId);
  // ... arrayMove magic ...
});
```
**The Issue:** `App.tsx` is a UI component. Its job is to draw boxes on the screen. It should *not* know how to calculate array indices or mutate state arrays directly. By putting this math in `App.tsx`, we violated SRP. We let the "Brain" logic leak into the "UI" logic.
**The Fix:** Move this complex sorting math into `useTasks.ts` where state logic belongs.
```typescript
// useTasks.ts
const reorderTasks = (activeId: string, overId: string) => {
  setTasks((currentTasks) => {
    // Do the messy arrayMove math here!
  });
}

// App.tsx
const { reorderTasks } = useTasks();
const handleDragOver = (event) => {
  reorderTasks(event.active.id, event.over.id);
}
```

### Prop Drilling
Look at how `deleteTask` travels:
It starts in `App.tsx` -> gets passed to `<Column onDeleteTask={deleteTask}>` -> gets passed to `<TaskCard onDelete={onDeleteTask}>`.
**The Issue:** The `Column` component doesn't actually care about deleting tasks. It just acts as a middleman, carrying the function down to the `TaskCard`. This is called Prop Drilling. If our app grows, passing functions down 5 or 6 levels becomes a nightmare.
**The Fix:** For a small app, this is acceptable. But as it grows, we would fix this by using the React Context API or a state manager (like Zustand), allowing the `TaskCard` to directly say "Hey, delete me!" without relying on `Column` to pass the message.

---

## 4. Security & Vulnerabilities

Because we don't have a backend or a database yet, our security surface area is very small. But there is one thing to always keep in mind when dealing with user input:

### Cross-Site Scripting (XSS)
When a user types into the Add Task form, they could type a malicious script like `<script>stealPasswords()</script>`. 
**The Good News:** React is incredibly smart. When we do `<span className="task-title">{task.title}</span>`, React automatically "escapes" the text. It turns the dangerous script into harmless text on the screen.
**The Trap:** If a future developer gets lazy and decides to use `dangerouslySetInnerHTML` to allow users to make their task titles bold or italic, that protection vanishes, and the app becomes instantly vulnerable.
**The Fix:** Never use `dangerouslySetInnerHTML` with user-provided text. Always rely on React's default text rendering. 

---

Building software is about iteration. We build, we audit, and we refactor. You're doing great!
