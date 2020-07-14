import { computed, isReactive, reactive as vueReactive, ref, UnwrapRef, effect, stop, ReactiveEffect, track, trigger, TriggerOpTypes, } from '@vue/reactivity';
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';

export type ReactiveComponent<P = {}> = (props: P) => () => JSX.Element;

interface Hooks {
	onMounted?: () => void;
	onUnmounted?: () => void;
	onUpdated?: () => void;
}

let currentHooksHandle: Hooks | null = null;

const useReactiveProps = <P extends { [key: string]: any }>(props: P): P => {
	// convert props to a reactive object
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const reactiveProps = useMemo(() => isReactive(props) ? props : vueReactive(props), []) as P;

	// keep the old props object for future comparison
	const prevProps = useRef<P>(props);

	// update the reactive props when the component is forced to render
	useEffect(() => {
		const prev = prevProps.current;

		for (const key in props) {
			if (prev[key] !== props[key]) {
				reactiveProps[key] = props[key];
			}
		}

		prevProps.current = props;
	});

	// now we return a reactive props object which will also react to parent renders
	return reactiveProps;
}

// a hack to force component re-render
const useForceUpdate = () => {
	const [, forceRender] = useState({});
	return () => forceRender({});
}

// vue3 composition-api inspired implementation for react powered by mobx
export function createComponent<P = {}>(reactiveComponent: ReactiveComponent<P>): FunctionComponent<P> {

	// creating a functional component
	return (props: P) => {
		const reactiveProps = useReactiveProps(props);
		const forceUpdate = useForceUpdate();

		// creating a computed value for the render of the reactive component
		// attaching the lifecycle callbacks (hooks)
		// dispose handle of computed render to be called in unmount
		const { computedRender, hooks, dispose } = useMemo(() => {

			// empty object to be filled with hooks
			currentHooksHandle = {};

			// one time call for the 'reactive component' retrieving the render function which will be called for future renders
			// in this phase we get the hook calls to be referenced in lifecycle phases
			const renderer = reactiveComponent(reactiveProps);

			// keep the ref of the hooks obj
			const hooks = currentHooksHandle;

			// release the hook handle to be used by other components
			currentHooksHandle = null;

			// calling the render function within 'mobx computed' to cache the render and listen to the accessed reactive values.
			const computedRender = computed(() => renderer());

			const scheduler = {
				isRunning: false,
				run(job: ReactiveEffect<any>) {
					if (!this.isRunning) {
						this.isRunning = true;

						Promise.resolve().then(() => {
							job();
							this.isRunning = false;
						})
					}
				}
			}

			const renderEffect = effect(() => {
				forceUpdate();
				return computedRender.value;
			}, {
				computed: true,
				scheduler: scheduler.run,
			});

			function dispose() {
				stop(renderEffect);
				stop(computedRender.effect);
			}

			return {
				computedRender,
				hooks,
				dispose,
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		// call onUpdated
		useEffect(() => {
			hooks.onUpdated?.();
		});

		// call onMounted
		useEffect(() => {
			hooks.onMounted?.();
			return () => {
				dispose();
				// call onUnmounted
				hooks.onUnmounted?.();
			};
		}, [dispose, hooks]);

		// return the cached render
		return computedRender.value;
	};
}

export function onMounted(callback: () => void) {
	currentHooksHandle!.onMounted = callback;
}

export function onUnmounted(callback: () => void) {
	currentHooksHandle!.onUnmounted = callback;
}

export function onUpdated(callback: () => void) {
	currentHooksHandle!.onUpdated = callback;
}

type Reactive<T> = T extends object ? T : { value: T }

function createBox<T>(val: T): { value: T } {
	const observed = ref<T>(val);
	return {
		get value() {
			return observed.value as T
		},
		set value(v: T) {
			observed.value = v as UnwrapRef<T>;
		}
	}
}

export const reactive = <T>(val: T): Reactive<T> => {
	const type = typeof val;

	switch (type) {
		case 'object':
			return vueReactive(val as any) as Reactive<T>;
		case 'bigint':
		case 'number':
		case 'string':
		case 'boolean': {
			return createBox(val) as Reactive<T>
		}
		default:
			return vueReactive(val as any) as Reactive<T>;
	}
}

export type Calculated<T extends () => any> = {
	value: ReturnType<T>,
	// observe: (listener: (change: IValueDidChange<T>) => void, fireImmediately?: boolean) => Lambda;
}

export const calculated = <R>(fn: () => R) => {
	const cmp = computed(fn);

	return {
		get value() {
			return cmp.value;
		},
		// observe: cmp.observe
	}
}