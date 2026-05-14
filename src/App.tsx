import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Header } from './components/Header';
import { AddTaskForm } from './components/AddTaskForm';
import { Column } from './components/Column';
import { TaskCard } from './components/TaskCard';
import { useTasks } from './hooks/useTasks';
import { COLUMNS } from './types';
import type { Task, ColumnType } from './types';
import './styles/global.css';
import './styles/board.css';

export default function App() {
  const { tasks, setTasks, addTask, deleteTask } = useTasks([
    { id: '1', title: 'Buy fuel for generator', column: 'Now', createdAt: Date.now() - 3600000 },
    { id: '2', title: 'Reply client emails', column: 'Soon', createdAt: Date.now() - 7200000 },
    { id: '3', title: 'Pick up package at park', column: 'Later', createdAt: Date.now() },
  ]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].column !== tasks[overIndex].column) {
          const newTasks = [...tasks];
          newTasks[activeIndex].column = tasks[overIndex].column;
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Dropping a task over an empty column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex].column = overId as ColumnType;
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = () => {
    setActiveTask(null);
  };

  return (
    <>
      <Header />
      <AddTaskForm onAdd={addTask} />
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          {COLUMNS.map((col) => (
            <Column
              key={col}
              column={col}
              tasks={tasks.filter((t) => t.column === col)}
              onDeleteTask={deleteTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} onDelete={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
