import React from 'react';
import { calculated, createComponent, reactive } from '../../reactive';
import { store } from '../store';

export const Header = createComponent(() => {
	const todoText = reactive('');

	const isLongEnough = calculated(() => {
		return todoText.value.length > 3;
	})

	function createTodoItem() {
		store.createTodo(todoText.value);
		todoText.value = '';
	}

	return () => (
		<div className="header">
			<h1>todos</h1>
			<div>{isLongEnough.value ? 'long enough': 'type more'}</div>
			<input
				type="text"
				className="new-todo"
				value={todoText.value}
				onChange={e =>todoText.value = e.target.value}
				onKeyDown={e => {
					if (e.keyCode === 13) {
						createTodoItem();
					}
				}}
			/>
		</div>
	)
})