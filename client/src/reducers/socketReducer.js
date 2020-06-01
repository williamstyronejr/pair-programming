import {
  OPEN_SOCKET,
  CLOSE_SOCKET,
  SOCKET_CONNECTED,
  SOCKET_LOGGED,
} from '../actions/socket';

const initState = {
  connected: false,
  connecting: false,
  ready: false,
  error: '',
};

const socketReducer = (state = initState, action) => {
  switch (action.type) {
    case OPEN_SOCKET:
      return {
        ...state,
        connecting: true,
      };

    case CLOSE_SOCKET:
      return {
        ...state,
        connected: false,
        connecting: false,
        ready: false,
      };

    case SOCKET_CONNECTED:
      return {
        ...state,
        connected: true,
        connecting: false,
      };

    case SOCKET_LOGGED:
      return {
        ...state,
        ready: true,
      };

    default:
      return state;
  }
};

export default socketReducer;
