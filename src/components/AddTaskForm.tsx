import { useState } from 'react';
import '../styles/add-form.css';

interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title);
      setTitle('');
    }
  };

  return (
    <div className="add-form-container">
      <form className="add-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="add-input"
          placeholder="What's the next wahala?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button 
          type="submit" 
          className="add-btn"
          disabled={!title.trim()}
        >
          Add Task
        </button>
      </form>
    </div>
  );
}
