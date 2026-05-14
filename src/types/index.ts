export type ColumnType = 'Now' | 'Soon' | 'Later';

export interface Task {
  id: string;
  title: string;
  column: ColumnType;
  createdAt: number;
}

export const COLUMNS: ColumnType[] = ['Now', 'Soon', 'Later'];
