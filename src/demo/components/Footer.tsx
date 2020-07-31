import React from 'react';
import { createComponent } from '../../reactive';
import { values, actions } from '../store';


export const Footer = createComponent(() => {

	return () => (
		<footer className="footer">
			<span className="todo-count" >
				<strong>{values.leftTodosCount}</strong>
				<span>{' '}</span>
				<span>items </span>
				<span>left</span>
			</span>
			<ul className="filters">
				<li>
					<a href="#/" className={values.filter === 'all' ? 'selected' : ''} onClick={() => actions.setFilter('all')}>All</a>
				</li>
				<span> </span>
				<li>
					<a href="#/active" className={values.filter === 'active' ? 'selected' : ''} onClick={() => actions.setFilter('active')}>Active</a>
				</li>
				<span> </span>
				<li>
					<a href="#/completed" className={values.filter === 'completed' ? 'selected' : ''} onClick={() => actions.setFilter('completed')}>Completed</a>
				</li>
			</ul>
			<button className="clear-completed" onClick={actions.clearCompleted}>Clear completed</button>
		</footer>
	)
})