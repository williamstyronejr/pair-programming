import io from 'socket.io-client';
import { SET_CODE, TEST_PASSED, TEST_FAILED } from '../actions/challenge';
import { SEND_MESSAGE } from '../actions/chat';
import {
  OPEN_SOCKET,
  CLOSE_SOCKET,
  socketLogged,
  socketConnected,
} from '../actions/socket';
import {
  ADD_USER_TO_QUEUE,
  LEAVE_QUEUE,
  ACCEPT_QUEUE,
  roomCreated,
  matchFound,
} from '../actions/queue';

const socket = io.connect('http://localhost:5000', { autoConnect: false });

export function socketMiddlware() {
  return (next) => (action) => {
    if (socket && socket.connected) {
      switch (action.type) {
        case CLOSE_SOCKET:
          socket.close();
          break;

        // Chat cases
        case 'join_room':
          socket.emit('joinRoom', action.payload.room, action.payload.username);
          break;

        case 'leave_room':
          socket.emit(
            'leaveRoom',
            action.payload.room,
            action.payload.username
          );
          break;

        case SEND_MESSAGE:
          socket.emit(
            'sendMessage',
            action.payload.room,
            action.payload.msg,
            Date.now()
          );
          return next(action);

        // Challenge cases
        case SET_CODE:
          socket.emit('sendCode', action.payload.room, action.payload.code);
          return next(action);

        // Queue handlers
        case ADD_USER_TO_QUEUE:
          socket.emit('joinQueue', action.payload.cId, action.payload.size);
          return next(action);

        case LEAVE_QUEUE:
          socket.emit('leaveQueue', action.payload);
          return next(action);

        case ACCEPT_QUEUE:
          socket.emit('acceptMatch', action.payload);
          return next(action);

        default:
          return next(action);
      }
    }

    // Handle connecting the socket to server
    if (action.type === OPEN_SOCKET) {
      socket.open();
    }

    return next(action);
  };
}

export default (store) => {
  socket.on('connect', () => {
    // On connection, log user's socket
    socket.emit('logUser', store.getState().user.id);
    store.dispatch({
      type: 'chat_connected',
    });

    store.dispatch(socketConnected());
  });

  socket.on('disconnect', () => {});

  socket.on('userLogged', () => {
    store.dispatch(socketLogged());
  });

  // Handle event for when a match is found
  socket.on('matchFound', (queueId) => {
    store.dispatch(matchFound(queueId));
  });

  // Handles event for room being created
  socket.on('roomCreated', (roomId) => {
    store.dispatch(roomCreated(roomId));
  });

  // Handles message when a user joins a room
  socket.on('joinMessage', (username) => {
    store.dispatch({
      type: 'join_message',
      payload: username,
    });
  });

  // Handles when a user leave message
  socket.on('leaveMsg', (username) => {
    store.dispatch({
      type: 'leave_message',
      payload: username,
    });
  });

  // Handles when client socket receives a char message from server
  socket.on('receiveMessage', (msg, time) => {
    store.dispatch({
      type: 'add_message',
      payload: { msg, time },
    });
  });

  // Handles receiving code updates
  socket.on('receiveCode', (code) => {
    store.dispatch({
      type: 'UPDATE_CODE',
      payload: code,
    });
  });

  // Handle receiving test updates
  socket.on('testCompleted', (errors) => {
    // Check if there are any errors
    if (errors) {
      store.dispatch({
        type: TEST_FAILED,
        payload: errors,
      });
    } else {
      store.dispatch({ type: TEST_PASSED });
    }
  });
};
