import { action, computed, decorate, observable, reaction } from "mobx";

export interface TodoItem {
	text: string;
	isCompleted: boolean;
	dateCreated: number;
	isEditing: boolean;
}

type Filter = 'all' | 'active' | 'completed';

class TodoStore {
	public _todos: TodoItem[] = [];
	public _filter: Filter = 'all';

	get leftTodosCount() {
		return this._todos.filter(p => !p.isCompleted).length;

	}

	get todos() {
		switch (this._filter) {
			case 'all':
				return this._todos;
			case 'active':
				return this._todos.filter(p => !p.isCompleted);
			case 'completed':
				return this._todos.filter(p => p.isCompleted);
			default:
				return []
		}
	}

	get filter() {
		return this._filter;
	}

	public setFilter(filter: Filter) {
		this._filter = filter;
	}

	public createTodo(text: string) {
		this._todos.unshift({
			text,
			dateCreated: Date.now(),
			isCompleted: false,
			isEditing: false,
		});
	}

	public removeTodo(todo: TodoItem) {
		this._todos.splice(this._todos.indexOf(todo), 1);
	}

	public checkAll(check: boolean) {
		this._todos.forEach(p => p.isCompleted = check);
	}

	public clearCompleted() {
		this._todos = this._todos.filter(p => !p.isCompleted);
	}

	public populateStore() {
		const todos = JSON.parse(localStorage.getItem('todos') || '[]') as TodoItem[];
		const filter = JSON.parse(localStorage.getItem('filter') || '"all"') as Filter;

		this._todos = todos;
		this._filter = filter;
	}
}

decorate(TodoStore, {
	_todos: observable,
	_filter: observable,
	leftTodosCount: computed,
	todos: computed,
	filter: computed,
	setFilter: action,
	createTodo: action,
	removeTodo: action,
	checkAll: action,
	clearCompleted: action,
	populateStore: action,
});


export const store = new TodoStore();

reaction(() => {
	return {
		todos: store.todos.map(p => ({ ...p })),
		filter: store.filter,
	}
}, ({ todos, filter }) => {
	localStorage.setItem('todos', JSON.stringify(todos));
	localStorage.setItem('filter', JSON.stringify(filter));
});