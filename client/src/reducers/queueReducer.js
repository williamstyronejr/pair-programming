import {
  ADD_USER_TO_QUEUE,
  LEAVE_QUEUE,
  MATCH_FOUND,
  MATCH_TIMEOUT,
  ACCEPT_QUEUE,
  DECLINE_MATCH,
  ROOM_CREATED,
  CLEAR_QUEUE,
  TICK_TIMER,
} from '../actions/queue';

const initState = {
  inQueue: false, // Flag indicating user is in queue
  leaveQueue: false, // Flag for when user leaves queue (timeout/decline/leave)
  matchFound: false, // Flag to indicate if a match was found
  acceptTimer: 0, // Timer to accept queue
  acceptedMatch: false, // Flag indicating a user accepted the match
  declinedMatch: false, // Flag indicating a user declined the match
  matchId: null, // Id of match from queue
  roomId: null, // Id of room when/if one is created
  queueTimer: 0, // Timer for how long user is in queue
};

const queueReducer = (state = initState, action) => {
  switch (action.type) {
    case ADD_USER_TO_QUEUE:
      return {
        ...state,
        inQueue: true,
        acceptedMatch: false,
        declinedMatch: false,
        timedOut: false,
      };

    case LEAVE_QUEUE:
      return {
        ...state,
        leaveQueue: true,
      };

    case MATCH_FOUND:
      return {
        ...state,
        matchFound: true,
        matchId: action.payload,
        acceptedMatch: false,
        declinedMatch: false,
        roomId: null,
      };

    case MATCH_TIMEOUT:
      return {
        ...state,
        inQueue: false,
        leaveQueue: true,
        matchFound: false,
        acceptedMatch: false,
        declinedMatch: false,
        acceptTimer: 0,
      };

    case ACCEPT_QUEUE:
      return {
        ...state,
        acceptedMatch: true,
        declinedMatch: false,
      };

    case DECLINE_MATCH:
      return {
        ...initState,
        inQueue: false,
        leaveQueue: true,
        matchFound: false,
        acceptedMatch: false,
        declinedMatch: true,
        acceptTimer: 0,
        queueTimer: 0,
      };

    case ROOM_CREATED:
      return {
        ...state,
        roomId: action.payload,
      };

    case CLEAR_QUEUE:
      return initState;

    case TICK_TIMER:
      return {
        ...state,
        acceptTimer: state.acceptTimer + 1,
      };

    default:
      return state;
  }
};

export default queueReducer;
