import { flow, observable, action as mobAction } from "mobx";
import { CancellablePromise } from "mobx/lib/api/flow";
import { calculated, Calculated } from "./index";

type Store = { [key: string]: any };

let _store: Store;

export const createStore = <T extends Store>(store: T): T => {
	_store = observable(store)
	return _store as T;
};

type GeneratorReturn<T> = T extends Generator<unknown, infer R, unknown> ? R : never;

type Actions = { [key: string]: (...args: any[]) => Generator | AsyncGenerator | any }

type FlowActions<T extends Actions> = { [key in keyof T]:
	T[key] extends ((...args: any[]) => Generator | AsyncGenerator) ?
	(...p: Parameters<T[key]>) => CancellablePromise<GeneratorReturn<ReturnType<T[key]>>> :
	(...p: Parameters<T[key]>) => ReturnType<T[key]>
}

export function createActions<S extends Store, T extends Actions>(actionsMapCreator: (s: S) => T): FlowActions<T> {
	const actionsMap = actionsMapCreator(_store as S);
	return Object.keys(actionsMap).reduce((result, key: keyof T) => {
		const action = actionsMap[key];

		if (action instanceof (function* () { }).constructor) {
			result[key] = flow(action as any) as any;
		} else {
			result[key] = mobAction(action) as any;
		}
		return result;
	}, {} as FlowActions<T>);
}

type OmitStateParameter<T extends (state: any, ...params: any[]) => any> = T extends (state: any, ...params: infer P) => any ? P : never;
type Action = ((state: any, ...params: any[]) => void) | ((state: any, ...params: any[]) => Generator | AsyncGenerator);
type Actionize<T extends Action> = T extends ((...args: any[]) => Generator | AsyncGenerator) ?
	(...args: OmitStateParameter<T>) => CancellablePromise<GeneratorReturn<ReturnType<T>>> :
	(...args: OmitStateParameter<T>) => ReturnType<T>;

export function action<T extends Action>(fn: T): Actionize<T> {
	const caller = (fn instanceof (function* () { }).constructor) ? flow(fn as any) : mobAction(fn);

	return ((...p: OmitStateParameter<T>) => caller(_store, ...p)) as Actionize<T>
}

type SelectorMap = { [key: string]: (...p: any[]) => any };
type Getters<T extends SelectorMap> = { [key in keyof T]: Calculated<T[key]> }

export function createSelectors<S, T extends SelectorMap>(selectorMapCreator: (s: S) => T): Getters<T> {
	const selectorMap = selectorMapCreator(_store as S);
	return Object.keys(selectorMap).reduce((result, key: keyof T) => {
		result[key] = calculated(selectorMap[key]);
		return result;
	}, {} as Getters<T>);
}

export const selector = <T extends (state: any) => any>(fn: T) => {
	return calculated(() => fn(_store)) as Calculated<() => ReturnType<T>>;
}




export const mapSelectors = <T extends SelectorMap>(selectors: Getters<T>) => {
	return Object.keys(selectors).reduce((acc, key) => {
		Object.defineProperty(acc, key, {
			get: () => selectors[key].value,
			set: (val: any) => selectors[key].value = val,
		})

		return acc;
	}, {}) as {[key in keyof T]: ReturnType<T[key]>}
}