import { computed, effect, isReactive, reactive as vueReactive, stop } from '@vue/reactivity';
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { createTickScheduler } from './shared';

export type Renderer = () => JSX.Element;
export type ReactiveComponent<P = {}> = (props: P) => Renderer;

type Callback = () => void;

interface LifeCycle {
	onMounted: Callback[];
	onUnmounted: Callback[];
	onUpdated: Callback[];
}

let currentLifecycleHandle: LifeCycle | null = null;

const initLifeCycles = (): LifeCycle => ({
	onMounted: [],
	onUnmounted: [],
	onUpdated: [],
})

const useReactiveProps = <P extends { [key: string]: any }>(props: P): P => {
	// convert props to a reactive object
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const reactiveProps = useMemo(() => isReactive(props) ? props : vueReactive({ ...props }), []) as P;

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

let _isInSetupPhase = false;

const setup = (setupFunction: Function): Renderer => {
	_isInSetupPhase = true;
	const renderer = setupFunction();
	_isInSetupPhase = false;
	return renderer;
}

// reactive react component implementation
export function createComponent<P = {}>(reactiveComponent: ReactiveComponent<P>): FunctionComponent<P> {

	// creating a functional component
	return (props: P) => {
		const reactiveProps = useReactiveProps(props);
		const forceUpdate = useForceUpdate();

		// creating a computed value for the render of the reactive component
		// attaching the lifecycle callbacks
		// dispose handle of computed render to be called in unmount
		const { computedRender, lifecycles, dispose } = useMemo(() => {

			// empty object to be filled with lifecycles
			currentLifecycleHandle = initLifeCycles();

			// one time call for the 'reactive component' retrieving the render function which will be called for future renders
			// in this phase we get the lifecycle calls to be referenced in lifecycle phases

			const renderer = setup(() => reactiveComponent(reactiveProps));

			// keep the ref of the lifecycle obj
			const lifecycles = currentLifecycleHandle;

			// release the lifecycle handle to be used by other components
			currentLifecycleHandle = null;

			// calling the render function within 'computed' to cache the render and listen to the accessed reactive values.
			const computedRender = computed(() => renderer());

			const renderEffect = effect(() => {
				forceUpdate();
				return computedRender.value;
			}, {
				computed: true,
				scheduler: createTickScheduler(),
			});

			function dispose() {
				stop(renderEffect);
				stop(computedRender.effect);
			}

			return {
				computedRender,
				lifecycles,
				dispose,
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		// call onUpdated
		useEffect(() => {
			lifecycles.onUpdated.forEach(p => p());
		});

		// call onMounted
		useEffect(() => {
			lifecycles.onMounted.forEach(p => p());
			return () => {
				dispose();
				// call onUnmounted
				lifecycles.onUnmounted.forEach(p => p());
			};
		}, [dispose, lifecycles]);

		// return the cached render
		return computedRender.value;
	};
}

export function onMounted(callback: () => void) {
	currentLifecycleHandle!.onMounted.push(callback);
}

export function onUnmounted(callback: () => void) {
	currentLifecycleHandle!.onUnmounted.push(callback);
}

export function onUpdated(callback: () => void) {
	currentLifecycleHandle!.onUpdated.push(callback);
}

export const isInSetupPhase = () => _isInSetupPhase;