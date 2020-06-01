import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Root from './components/Root';
import configureStore from './store/store';
import { getUserData } from './actions/authentication';
import setupSocket from './utils/socket';
import 'normalize.css';
import './styles/index.css';

const store = configureStore({});

// TODO: Dispatch only when there's a cookie present
store.dispatch(getUserData());

// Setup handlers for socket
setupSocket(store);

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);
