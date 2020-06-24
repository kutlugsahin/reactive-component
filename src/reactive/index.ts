import { action, computed, isObservable, observable } from 'mobx';
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';

export type ReactiveComponent<P = {}> = (props: P) => () => JSX.Element;

interface Hooks {
	onMounted?: () => void;
	onUnmounted?: () => void;
	onUpdated?: () => void;
}

let currentHooksHandle: Hooks | null = null;

const useReactiveProps = <P>(props: P) => {
	// convert props to a reactive object
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const reactiveProps = useMemo(() => isObservable(props) ? props : observable(props), []);

	// keep the old props object for future comparison
	const prevProps = useRef<P>(props);

	// update the reactive props when the component is forced to render
	useEffect(() => {
		const prev = prevProps.current;

		for (const key in props) {
			if (prev[key] !== props[key]) {
				console.log(reactiveProps[key], props[key]);
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

			// now we observe the computed value and when it's invalidated we will re-render
			const dispose = computedRender.observe(action(() => {
				forceUpdate();
			}))

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
		return computedRender.get();
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