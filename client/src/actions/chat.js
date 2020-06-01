// Action types that involve socket actions
export const ADD_MESSAGE = 'add_message';
export const JOIN_ROOM = 'join_room';
export const LEAVE_ROOM = 'leave_room';
export const SEND_MESSAGE = 'send_message';
export const CHAT_CONNECTED = 'chat_connected';

export const SET_MESSAGE = 'set_message';
export const JOIN_MESSAGE = 'join_message';
export const LEAVE_MESSAGE = 'leave_message';

export const TOGGLE_CHAT_VISIBILITY = 'chat_visibility';

/**
 * Redux action creator for setting chat's visibility.
 * @param {boolean} visible Boolean indicating if chat is visible
 * @return {object} Redux action
 */
export function toggleChatVisibility() {
  return {
    type: TOGGLE_CHAT_VISIBILITY
  };
}

export function setMessage(text) {
  return {
    type: SET_MESSAGE,
    payload: text
  };
}

export function sendMessage(room, msg) {
  return {
    type: SEND_MESSAGE,
    payload: { room, msg }
  };
}
