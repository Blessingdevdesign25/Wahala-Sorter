
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import { formatTimestamp } from '../utils/time';
import '../styles/task-card.css';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="task-header">
        <span className="task-title">{task.title}</span>
        <button
          className="delete-btn"
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking delete
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          title="Delete task"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
      <div className="task-footer">
        <span className="task-time">{formatTimestamp(task.createdAt)}</span>
      </div>
    </div>
  );
}
