import React from 'react';
import { createComponent } from '../../reactive';
import { observable } from 'mobx';
import { store } from '../store';

export const Header = createComponent(() => {
	const todoText = observable.box('');

	function createTodoItem() {
		store.createTodo(todoText.get());
		todoText.set('');
	}

	return () => (
		<div className="header">
			<h1>todos</h1>
			<input
				type="text"
				className="new-todo"
				value={todoText.get()}
				onChange={e => todoText.set(e.target.value)}
				onKeyDown={e => {
					if (e.keyCode === 13) {
						createTodoItem();
					}
				}}
			/>
		</div>
	)
})