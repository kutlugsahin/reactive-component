import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './demo/App';
import './style.css';
import { App as VueApp, List } from './vue-reactivity'; 
ReactDOM.render(
  // <React.StrictMode>
  // <VueApp />
  <List/>
  // </React.StrictMode>
  ,document.getElementById('root')
);