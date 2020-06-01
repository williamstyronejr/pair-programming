export const OPEN_SOCKET = 'open_socket';
export const CLOSE_SOCKET = 'close_socket';
export const SOCKET_CONNECTED = 'socket_connected';
export const SOCKET_LOGGED = 'socket_logged';

export function openSocket() {
  return { type: OPEN_SOCKET };
}

export function closeSocket() {
  return { type: CLOSE_SOCKET };
}

export function socketConnected() {
  return { type: SOCKET_CONNECTED };
}

export function socketLogged() {
  return { type: SOCKET_LOGGED };
}
