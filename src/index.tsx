import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './demo/App';
import { App as StoreDemoApp } from './storedemo';
import { App as VueApp } from './vue-reactivity'; 
ReactDOM.render(
  // <React.StrictMode>
  <VueApp />
  // </React.StrictMode>
  ,document.getElementById('root')
);