import { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { ColumnType, Task } from '../types';
import { TaskCard } from './TaskCard';
import '../styles/board.css';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
}

export function Column({ column, tasks, onDeleteTask }: ColumnProps) {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const { setNodeRef } = useDroppable({
    id: column,
    data: {
      type: 'Column',
      column,
    },
  });

  return (
    <div className="column">
      <div className="column-header">
        <span>{column}</span>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-body" ref={setNodeRef}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
