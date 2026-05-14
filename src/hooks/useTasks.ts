import { useState } from 'react';
import type { Task, ColumnType } from '../types';

export function useTasks(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (title: string, column: ColumnType = 'Now') => {
    if (!title.trim()) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      column,
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return { tasks, setTasks, addTask, deleteTask };
}
