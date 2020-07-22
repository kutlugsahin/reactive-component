import React from 'react';
import { createStore, selector, action, watch, createComponent, reactive, createTickScheduler, onUnmounted, computed } from '../reactive';

interface User { name: string; id: number };

interface Store {
	users: User[],
};

createStore<Store>({
	users: [],
})

const userCount = selector((s: Store) => {
	return s.users.length;
})

const addUser = action(async (state: Store, name: string) => {
	state.users.push({
		name,
		id: state.users.length,
	});

	state.users.push({
		name,
		id: state.users.length,
	});

	state.users.push({
		name,
		id: state.users.length,
	});

	await new Promise(res => setTimeout(res, 2000));

	state.users.pop();
	state.users.pop();
})

const s = reactive({
	users: Array(10).fill(null).map((_, i) => ({ name: `user ${i}`, id: i })),
	ui: {
		leftPanelOpen: false,
	}
});

const users = selector((state: Store) => state.users);

const User = createComponent(() => {
	const clicks = reactive(0);

	const chars = reactive([] as number[]);

	watch(() => clicks.value, (newVal, oldVal) => {
		console.log(newVal, oldVal);
	}, {
		scheduler: createTickScheduler(),
	})

	return () => {
		console.log('user renders');
		return (
			<div>
				<div onClick={(e) => {
					clicks.value++;
					chars.push(clicks.value);
				}}>USer clicks{clicks.value}</div>
				<div>
					{chars.map(ch => <div>{ch}</div>)}
				</div>
			</div>
		)
	}
})

export const App = createComponent(() => {
	const username = reactive('');

	return () => {
		console.log('renderer');
		const userList = users.value.map((p) => <div key={p.id}>{p.name}</div>);

		return (
			<div>
				<h5>try spy</h5>
				<button onClick={() => s.ui.leftPanelOpen = !s.ui.leftPanelOpen}>update</button>
				<button onClick={() => s.users[0].name = Math.random() + ''}>update</button>
				<div>
					******************
				</div>
				<User />
				<div>
					<input type="text" value={username.value} onChange={e => username.value = e.target.value} />
					<button onClick={() => {
						addUser(username.value);
						username.value = '';
					}}>Add</button>
				</div>
				<div><b>Count: {userCount.value}</b></div>
				{userList}
			</div>
		)
	}
})

interface Item {
	name: string;
	id: number;
	selected: boolean;
}

const ListItem = createComponent((props: { item: Item; onSelect: (id: number) => void }) => {

	const label = computed(() => {
		return props.item.name + ' - ' + props.item.id;
	})

	return () => {
		console.log('item renders');
		return (
			<div className={props.item.selected ? 'selected' : ''} onClick={e => props.onSelect(props.item.id)}>
				{label.value}
			</div>
		)
	}
})

export const List = createComponent(() => {
	const _items = Array(10).fill(null).map((_, i) => ({
		name: `item ${i}`,
		id: i,
		selected: false,
	}));

	const items = reactive(_items);

	return () => {
		console.log('list render')
		return (
			<div>
				{items.map((p) => <ListItem key={p.id} item={p} onSelect={id => {
					const index = items.findIndex(p => p.id === id);
					items.splice(index, 1);
				}} />)}
			</div>
		)
	}
})