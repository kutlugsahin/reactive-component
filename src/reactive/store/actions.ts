import { Calculated, computed } from '../shared';
import { getGlobalStore, State } from './createStore';

export type OmitStateParameter<T extends (state: any, ...params: any[]) => any> = T extends (state: any, ...params: infer P) => any ? P : never;

export type FunctionWithoutState<T extends (state: any, ...params: any[]) => any> = (...p: OmitStateParameter<T>) => ReturnType<T>;

export const action = <T extends (s: any, ...p: any[]) => any>(fn: T): FunctionWithoutState<T> => {
	return (...params: OmitStateParameter<T>) => {
		return fn(getGlobalStore() as any, ...params);
	}
}

export type Action = (s: any, ...params: any[]) => any;
export type ActionMap = { [key: string]: Action }
export type ActionMapWithoutState<T extends ActionMap> = { [key in keyof T]: FunctionWithoutState<T[key]> }

export type Selector = (s: any) => any;
export const selector = <T extends Selector>(fn: T): Calculated<ReturnType<T>> => {
	return computed(() => fn(getGlobalStore()));
}


// export type SelectorWithParams = (...args: any) => any;

// export const selectorFactory = <T extends SelectorWithParams>(selector: T): FunctionWithoutState<T> => {

// 	// let computedValue;

// 	// return (...p: OmitStateParameter<T>) => {
// 	// 	if (!computedValue) {
// 	// 		computedValue = computed(() => {
// 	// 			return 
// 	// 		})
// 	// 	}
// 	// }
// }

