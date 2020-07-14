import { createStore, createActions, createSelectors, action, selector, mapSelectors } from "../reactive/store";
import { createComponent, reactive, calculated } from "../reactive";
import React from 'react';

interface User {
	name: string;
	id: number;
}

interface Store {
	users: User[];
	selectedUserId: number | null;
}

createStore<Store>({
	users: [],
	selectedUserId: null,
});

const actions = createActions((state: Store) => ({
	addUser: function* (name: string) {
		console.log(state.users.length);
		state.users.push({
			name,
			id: state.users.length,
		});
		console.log(state.users.length);

		state.users.push({ name: 'random', id: 9999 });
		state.users.pop();
		state.users.push({ name: 'random', id: 9999 });
		state.users.pop();
		state.users.push({ name: 'random', id: 9999 });
		state.users.pop();
		state.users[0].name = `${state.users[0].name}x`

		yield 0;
	}
}));

const addUser = action(function* (state: Store, name: string) {
	console.log(state.users.length);
	state.users.push({
		name,
		id: state.users.length,
	});
	console.log(state.users.length);

	state.users.push({ name: 'random', id: 9999 });
	state.users.pop();
	state.users.push({ name: 'random', id: 9999 });
	state.users.pop();
	state.users.push({ name: 'random', id: 9999 });
	state.users.pop();
	state.users[0].name = `${state.users[0].name}x`

	yield 0;
})

const users = selector((state: Store) => state.users);

const selectors = createSelectors((state: Store) => ({
	users: () => users.value,
	userCount: () => users.value.length,
}));

export const userActions = createActions((state: Store) => {

	function add(name: string) {
		console.log(state.users.length);
		state.users.push({
			name,
			id: state.users.length,
		});
		console.log(state.users.length);

		state.users.push({ name: 'random', id: 9999 });
		state.users.pop();
		state.users.push({ name: 'random', id: 9999 });
		state.users.pop();
		state.users.push({ name: 'random', id: 9999 });
		state.users.pop();
		state.users[0].name = `${state.users[0].name}x`

		// yield 0;
	}

	return {
		add,
	}
})

export const App = createComponent(() => {
	const { userCount } = selectors;
	const username = reactive('');

	return () => {
		console.log('renderer');
		const userList = users.value.map((p) => <div key={p.id}>{p.name}</div>);

		return (
			<div>
				<div>
					<input type="text" value={username.value} onChange={e => username.value = e.target.value} />
					<button onClick={() => {
						userActions.add(username.value);
						username.value = '';
					}}>Add</button>
				</div>
				<div><b>Count: {userCount.value}</b></div>
				{userList}
			</div>
		)
	}
})
