import { createStore, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import reducers from '../reducers/index';
import { socketMiddlware } from '../utils/socket';

/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

export default initState =>
  createStore(
    reducers,
    initState,
    composeEnhancers(applyMiddleware(createLogger(), thunk, socketMiddlware))
  );
