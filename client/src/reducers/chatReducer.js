import {
  JOIN_ROOM,
  JOIN_MESSAGE,
  LEAVE_MESSAGE,
  ADD_MESSAGE,
  SEND_MESSAGE,
  CHAT_CONNECTED,
  SET_MESSAGE,
  TOGGLE_CHAT_VISIBILITY,
} from '../actions/chat';
import { CLOSE_SOCKET } from '../actions/socket';

const initState = {
  connected: false,
  connecting: false,
  roomJoined: false,
  messages: [],
  chatInput: '',
  visible: false,
};

/**
 * Creates an object to represent a chat message.
 * Message in format: { type, text, stamp }
 * @param {String} type Type of message ('notification', 'user', 'server')
 * @param {String} content Message content
 * @param {Number} time Timestamp of when message was sent
 * @return {Object} Returns the message object
 */
function createMessage(type, content, time) {
  return {
    type,
    content,
    time,
  };
}

/**
 * Creates a new array with 'item' inserted appended.
 * @param {Array} array Array to copy.
 * @param {*} item Item to be inserted into array.
 * @returns {Array} Returns a new array with item inserted.
 */
function insertItem(array, item) {
  return [...array, item];
}

const ChatReducer = (state = initState, action) => {
  switch (action.type) {
    case CHAT_CONNECTED:
      return {
        ...state,
        connected: true,
        messages: [...state.messages],
      };

    case JOIN_ROOM:
      return {
        ...state,
        roomJoined: true,
      };

    case JOIN_MESSAGE:
      return {
        ...state,
        messages: insertItem(
          state.messages,
          createMessage(
            'notification',
            `${action.payload} has joined.`,
            Date.now()
          )
        ),
      };
    case LEAVE_MESSAGE:
      return {
        ...state,
        messages: insertItem(
          state.messages,
          createMessage(
            'notification',
            `${action.payload} has left.`,
            Date.now()
          )
        ),
      };

    case ADD_MESSAGE:
      return {
        ...state,
        messages: insertItem(
          state.messages,
          createMessage('server', action.payload.msg, action.payload.time)
        ),
      };

    case SET_MESSAGE: // Set message in chat input
      return {
        ...state,
        messages: [...state.messages],
        chatInput: action.payload,
      };

    case SEND_MESSAGE: // Store sent messages locally
      return {
        ...state,
        messages: insertItem(
          state.messages,
          createMessage('client', action.payload.msg, Date.now())
        ),
        chatInput: '',
      };

    case CLOSE_SOCKET:
      return {
        ...state,
        messages: [...state.messages],
        connected: false,
        connecting: false,
        roomJoined: false,
      };

    case TOGGLE_CHAT_VISIBILITY:
      return {
        ...state,
        visible: !state.visible,
      };

    default:
      return state;
  }
};

export default ChatReducer;
