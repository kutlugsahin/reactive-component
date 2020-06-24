import React from 'react';
import { createComponent, onMounted } from '../reactive';
import './styles.css';
import { Header } from './components/Header';
import { List } from './components/List';
import { Footer } from './components/Footer';
import { store } from './store';

export const App = createComponent(() => {
	onMounted(() => {
		store.populateStore();
	})

	return () => (
		<section className="todoapp">
			<div>
				<Header />
				<List />
				<Footer/>
			</div>
		</section>
	)
})