import { Patch, Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 4072;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const postCreateTodo = ({
  title,
  completed,
  userId,
}: Omit<Todo, 'id'>) => {
  return client.post<Todo>('/todos', { title, completed, userId });
};

export const deleteTodo = (id: number) => {
  return client.delete<Todo>(`/todos/${id}`);
};

export const updateTodo = ({ id, title }: Omit<Patch, 'completed'>) => {
  return client.patch<Patch>(`/todos/${id}`, { id, title });
};

export const checkedTodo = ({ id, completed }: Omit<Patch, 'title'>) => {
  return client.patch<Patch>(`/todos/${id}`, { id, completed });
};

// Add more methods here
