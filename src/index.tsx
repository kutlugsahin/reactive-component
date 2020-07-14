import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './demo/App';
import { App as StoreDemoApp } from './storedemo';
ReactDOM.render(
  // <React.StrictMode>
  <StoreDemoApp />
  // </React.StrictMode>
  ,document.getElementById('root')
);