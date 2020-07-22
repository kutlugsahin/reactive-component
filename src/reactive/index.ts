import { WatchOptions as WatchOptionsType } from './shared';
export { createComponent, onMounted, onUnmounted, onUpdated } from './component';
export { computed, reactive, watch, createTickScheduler, ref } from './shared';
export { action, selector } from './store/actions';
export { createStore } from './store/createStore';


export type WatchOptions = WatchOptionsType;