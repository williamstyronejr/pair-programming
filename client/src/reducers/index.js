import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import userReducer from './userReducer';
import challengeReducer from './challengeReducer';
import chatReducer from './chatReducer';
import socketReducer from './socketReducer';
import queueReducer from './queueReducer';

export default combineReducers({
  form: formReducer,
  user: userReducer,
  challenge: challengeReducer,
  chat: chatReducer,
  socket: socketReducer,
  queue: queueReducer,
});
