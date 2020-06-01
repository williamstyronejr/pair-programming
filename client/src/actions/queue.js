// Action types
export const TICK_TIMER = 'tick_timer';
export const ADD_USER_TO_QUEUE = 'join_queue';
export const LEAVE_QUEUE = 'leave_queue';
export const ACCEPT_QUEUE = 'accept_match';
export const DECLINE_MATCH = 'decline_match';
export const MATCH_FOUND = 'match_found';
export const MATCH_TIMEOUT = 'match_timeout';
export const MATCH_CREATED = 'match_created';
export const ROOM_CREATED = 'room_created';
export const CLEAR_QUEUE = 'clear_queue';

let acceptTimerId = null; // Timer for when match is founded

/**
 * Redux action creator
 * @return {Object} Redux action.
 */
export function tickAcceptTimer() {
  return {
    type: TICK_TIMER
  };
}

/**
 * Redux action creator for adding current user to a challenge queue of a
 *  specific size.
 * @param {string} cId Id of challenge the user is trying to complete
 * @param {number} size Max number of users to match with
 * @return {Object} Redux action for adding users to challenge queue.
 */
export function joinQueue(cId, size = 2) {
  return {
    type: ADD_USER_TO_QUEUE,
    payload: {
      cId,
      size
    }
  };
}

/**
 * Redux action creator for handling user leaving queue.
 * @param {string} queueId Id of queue the user is leaving
 * @return {Object} Redux action.
 */
export function leaveQueue(queueId) {
  return {
    type: LEAVE_QUEUE,
    payload: queueId
  };
}

/**
 * Redux action creator for when a match is found for a user.
 * @param {string} queueId
 * @return {Object} Redux action.
 */
export function matchFound(queueId) {
  return dispatch => {
    // Setup timer
    acceptTimerId = setInterval(() => {
      dispatch(tickAcceptTimer());
    }, 1000);

    dispatch({
      type: MATCH_FOUND,
      payload: queueId
    });
  };
}

/**
 * Redux action creator for timing out a match. Used when a user did not,
 *  accept or decline match before given time.
 * @return {Object} Redux action
 */
export function matchTimeout() {
  clearInterval(acceptTimerId); // Stop accept timer
  return {
    type: MATCH_TIMEOUT
  };
}

/**
 * Redux action creator for accepting a match.
 * @param {string} queueId Id of queue the user is accepting.
 * @return {Object} Redux action
 */
export function acceptMatch(queueId) {
  return {
    type: ACCEPT_QUEUE,
    payload: queueId
  };
}

/**
 * Redux action creator for declining a match.
 * @param {string} queueId Id of queue the user is declining.
 * @return {Object} Redux action
 */
export function declineMatch(queueId) {
  clearInterval(acceptTimerId); // Stop accept timer
  return {
    type: DECLINE_MATCH,
    payload: queueId
  };
}

/**
 * Redux action creator for when a room is created.
 * @param {string} roomId Id of room that was created
 * @return {Object} Redux action
 */
export function roomCreated(roomId) {
  return {
    type: ROOM_CREATED,
    payload: roomId
  };
}

/**
 * Redux action creator for resetting queue data and will clear timer
 *  if active.
 * @return {Object} Redux action.
 */
export function clearQueue() {
  if (acceptTimerId) clearInterval(acceptTimerId);
  return {
    type: CLEAR_QUEUE
  };
}
