import React from 'react';
import { createComponent } from '../../reactive';
import { store } from '../store';


export const Footer = createComponent(() => {

	return () => (
		<footer className="footer">
			<span className="todo-count" >
				<strong>{store.leftTodosCount}</strong>
				<span>{' '}</span>
				<span>items </span>
				<span>left</span>
			</span>
			<ul className="filters">
				<li>
					<a href="#/" className={store.filter === 'all' ? 'selected' : ''} onClick={() => store.setFilter('all')}>All</a>
				</li>
				<span> </span>
				<li>
					<a href="#/active" className={store.filter === 'active' ? 'selected' : ''} onClick={() => store.setFilter('active')}>Active</a>
				</li>
				<span> </span>
				<li>
					<a href="#/completed" className={store.filter === 'completed' ? 'selected' : ''} onClick={() => store.setFilter('completed')}>Completed</a>
				</li>
			</ul>
			<button className="clear-completed" onClick={store.clearCompleted}>Clear completed</button>
		</footer>
	)
})