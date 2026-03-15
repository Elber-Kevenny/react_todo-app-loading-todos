/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { useState } from 'react';
import { useEffect } from 'react';
import { UserWarning } from './UserWarning';
import {
  checkedTodo,
  deleteTodo,
  getTodos,
  postCreateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { TodoList } from './componentes/todolist';
import { TodoContext } from './context/todocontext';
import { TodoApp } from './componentes/todoApp';
import { FILTERS } from './filters/filter';
import classNames from 'classnames';

export const App: React.FC = () => {
  const [title, setTitle] = useState<string>('');

  const [todo, setTodo] = useState<Todo[]>([]);

  const { all, active, completed } = FILTERS;

  const [filter, setFilter] = useState<string>(all);

  const [isShowFooter, setIsShowFooter] = useState<boolean>(false);
  const [isShowActiveAll, setIsShowActiveAll] = useState<boolean>(false);

  const addTodo = ({ title: todoTitle, completed: isDone, userId }: Todo) => {
    postCreateTodo({ todoTitle, isDone, userId })
      .then(newTodo => {
        setTodo(currentTodos => [...currentTodos, newTodo]);
      })
      .catch(error =>  (error));
  };

  const reset = () => {
    setTitle('');
  };

  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (title.trim().length === 0) {
      return;
    }

    addTodo({
      userId: USER_ID,
      title: title.trim(),
      completed: false,
    });

    reset();
  };

  const handleSelected = (id: number, newStatus: boolean) => {
    checkedTodo({ id, completed: newStatus })
      .then(() => {
        setTodo(prev => {
          return prev.map(i => {
            if (i.id === id) {
              return { ...i, completed: newStatus };
            }

            return i;
          });
        });
      })
      .catch(error => (error));
  };

  const handleRemove = (id: number) => {
    deleteTodo(id);
    setTodo(
      todo.filter(i => {
        return i.id !== id; // retorne o array de objetos com os ojetos cujo id é diferente do id do elemento que foi clicado
      }),
    );
  };

  const filteredTodo = todo.filter(t => {
    /* todo tem todos os elementos do array
        a unica coisa que filter faz é dizer: mostre os ativos, mostre todos, mostre os completos
        não posso filtrar o valor de todo e dar um setTodo pois isso vai subcrever os valores.
        */
    if (!t) {
      return false;
    } else if (filter === active) {
      /* - Se o filtro atual for "active", retorna true apenas para os itens
        não concluídos (t.completed === false).
  - Resultado: só tarefas ativas entram no array.
  */
      return t.completed === false;
    } else if (filter === completed) {
      /*- Se o filtro atual for "completed",
        retorna true apenas para os itens concluídos (t.completed === true).
  - Resultado: só tarefas concluídas entram no array.

        */
      return t.completed === true;
    }

    return true; /* - Se não for "active" nem "completed", cai aqui.
- Isso significa que o filtro é "all".
- Retorna true para todos os itens, ou seja, mantém todos no array.
 */
  });

  const handleActiveAll = () => {
    const allCompleted = todo.every(
      t => t.completed === true,
    ); /* retorna true se todos t.completed forem true*/

    const newArray = todo.map(t => {
      return {
        ...t,
        completed: !allCompleted,
      }; /* completed sera sobrescrevido com a negação do allcompleted, assim
       conseguimos alternar entre false e true, o spreed copiará todas as propriedades */
    });

    setTodo(newArray);
  };

  const handleFilterAll = () => setFilter(all);

  const handleActive = () => setFilter(active);

  const handleCompleted = () => setFilter(completed);

  const handleRemoveCompleted = () => {
    setTodo(todo.filter(t => t.completed === false));
  };

  useEffect(() => {
    getTodos().then(todosVindoDaApi => {
      /* getTodos armazena todas as tarefas. todosVindoDaApi é
      quando um calculo assincrono é executado, ele passa seu resultado para a função que é o primeiro argumento de then  */
      setTodo(todosVindoDaApi);
    });
  }, []);

  useEffect(() => {
    setIsShowFooter(todo.some(t => t && t.title && t.title.trim().length > 0));
  }, [todo]); // executado quando todo muda
  /* .some(callback) retorna verdadeiro true se callback retornar um valor verdadeiro para pelo menos um elemento na matriz,
    caso contrário , retorna falso.*/

  useEffect(() => {
    setIsShowActiveAll(
      todo.every(f => f.completed === true),
    ); /* toda vez que houver uma alteração na
    dependencia filteredtodo o useefect é ativado e faz a verificação do settIsShowActiveAll
    every verifica se todos são true, a condição que passei como callback, se todos forem true ele retorna true
    */
  }, [todo]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          {isShowFooter && (
            <button
              type="button"
              className={classNames('todoapp__toggle-all', {
                active: isShowActiveAll,
              })}
              data-cy="ToggleAllButton"
              onClick={() => handleActiveAll()}
            />
          )}

          {/* Add a todo on form submit */}
          <form onSubmit={handleSubmit}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={title}
              onChange={handleTitle}
            />
          </form>
        </header>
        <TodoContext.Provider
          value={{
            todo,
            setTodo,
            handleSelected,
            handleRemove,
            filteredTodo,
            handleRemoveCompleted,
            filter,
            handleActive,
            handleCompleted,
            handleFilterAll,
          }}
        >
          <section className="todoapp__main" data-cy="TodoList">
            <TodoList />
          </section>

          {/* Hide the footer if there are no todos */}
          {isShowFooter && (
            <footer className="todoapp__footer" data-cy="Footer">
              <TodoApp />
            </footer>
          )}
        </TodoContext.Provider>
      </div>
    </div>
  );
};
