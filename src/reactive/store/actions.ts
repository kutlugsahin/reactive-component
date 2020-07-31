import { Calculated, computed } from '../shared';
import { getGlobalStore, State } from './createStore';

export type OmitStateParameter<T extends (state: any, ...params: any[]) => any> = T extends (state: any, ...params: infer P) => any ? P : never;

export type FunctionWithoutState<T extends (state: any, ...params: any[]) => any> = (...p: OmitStateParameter<T>) => ReturnType<T>;

export const action = <T extends (s: any, ...p: any[]) => any>(fn: T): FunctionWithoutState<T> => {
	return (...params: OmitStateParameter<T>) => {
		return fn(getGlobalStore() as any, ...params);
	}
}

export type Dictionary<T> = { [key: string]: T };

export type Action<S = any> = (s: S, ...params: any[]) => void;
export type ActionMap<S = any> = { [key: string]: Action<S> }
export type ActionMapWithoutState<T extends ActionMap> = { [key in keyof T]: FunctionWithoutState<T[key]> }

export type Selector<S = any> = (s: S) => any;
export const selector = <T extends Selector>(fn: T): Calculated<ReturnType<T>> => {
	return computed(() => fn(getGlobalStore()));
}

type SelectorMap<T extends { [key: string]: Selector }> = {
	[key in keyof T]: ReturnType<T[key]>
}

type ComputedSelectorMap<S, T extends Selectors<S>> = {
	[key in keyof T]: ReturnType<T[key]>
}


type Selectors<S> = { [key: string]: Selector<S> };

type Actions<T extends Dictionary<Action>> = {[key in keyof T]: FunctionWithoutState<T[key]>}

export const createSelectors = <S, T extends Selectors<S>>(selectors: T): ComputedSelectorMap<S, T> => {

	const result = {};

	for (const key in selectors) {
		if (Object.prototype.hasOwnProperty.call(selectors, key)) {
			const selectorResult = selector(selectors[key]);

			Object.defineProperty(result, key, {
				get() {
					return selectorResult.value;
				},
			});
		}
	}

	return result as ComputedSelectorMap<S, T>;
}

export const createActions = <S, T extends Dictionary<Action<S>>>(actions: T): Actions<T> => {

	const result: any = {};

	for (const key in actions) {
		if (Object.prototype.hasOwnProperty.call(actions, key)) {
			result[key] = action(actions[key]);
		}
	}

	return result as Actions<T>;
}

