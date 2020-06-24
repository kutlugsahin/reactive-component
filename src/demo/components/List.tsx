import React from 'react';
import { createComponent } from '../../reactive';
import { store } from '../store';
import { ListItem } from './ListItem';

export const List = createComponent(() => {

	function toggleCheckAll(check: boolean) {
		store.checkAll(check);
	}

	return () => (
		<section className="main">
			<input type="checkbox" id="toggle-all" className="toggle-all" onChange={e => toggleCheckAll(e.target.checked)} />
			<label htmlFor="toggle-all"></label>
			<ul className="todo-list">
				{store.todos.map((todo) => <ListItem key={todo.dateCreated} todo={todo} />)}
			</ul>
		</section>
	)
})