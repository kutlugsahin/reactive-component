import { createComponent ,reactive, calculated } from "../reactive";
import React from 'react';

interface User { name: string; id: number };

const state = reactive({
	users: [],
} as {
	users: User[],
})

const userCount = calculated(() => {
	return state.users.length;
})


const User = createComponent(() => {
	const clicks = reactive(0);

	return () => {
		console.log('user renders');
		return (
			<div onClick={() => clicks.value++}>USer clicks{clicks.value}</div>
		)
	}
})

export const App = createComponent(() => {
	const username = reactive('');

	function add(name: string) {
		state.users.push({
			name,
			id: state.users.length,
		})
	}

	return () => {
		console.log('renderer');
		const userList = state.users.map((p) => <div key={p.id}>{p.name}</div>);

		return (
			<div>
				<User/>
				<div>
					<input type="text" value={username.value} onChange={e => username.value = e.target.value} />
					<button onClick={() => {
						add(username.value);
						username.value = '';
					}}>Add</button>
				</div>
				<div><b>Count: {userCount.value}</b></div>
				{userList}
			</div>
		)
	}
})

