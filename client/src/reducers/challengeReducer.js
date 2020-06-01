import {
  SET_CHALLENGE_DATA,
  SET_CHALLENGE_ERROR,
  CLEAR_CHALLENGE_DATA,
  SET_CODE,
  ADD_INVITE_LINK,
  TEST_CODE,
  TEST_PASSED,
  TEST_FAILED,
} from '../actions/challenge';

const initState = {
  id: null,
  title: '',
  prompt: '',
  code: '',
  challengeError: null,
  private: null,
  inviteLink: null,
  testing: false,
  testPassed: false,
  testErrors: null,
};

const ChallengeReducer = (state = initState, action) => {
  switch (action.type) {
    case SET_CHALLENGE_DATA:
      return {
        ...state,
        title: action.payload.challenge.title,
        prompt: action.payload.challenge.prompt,
        private: action.payload.room.private,
        inviteLink: action.payload.room.inviteKey
          ? `localhost:3000/invite/${action.payload.room.inviteKey}`
          : null,
      };

    case SET_CHALLENGE_ERROR:
      return {
        ...state,
        challengeError: action.payload.error,
      };

    case CLEAR_CHALLENGE_DATA:
      return initState;

    case SET_CODE:
      return {
        ...state,
        code: action.payload.code,
      };

    case 'UPDATE_CODE':
      return {
        ...state,
        code: action.payload,
      };
    case ADD_INVITE_LINK:
      return {
        ...state,
        private: false,
        inviteLink: `localhost:3000/invite/${action.payload}`,
      };

    case TEST_CODE:
      return {
        ...state,
        testing: true,
      };

    case TEST_PASSED:
      return {
        ...state,
        testPassed: true,
        testing: false,
      };

    case TEST_FAILED:
      return {
        ...state,
        testPassed: false,
        testErrors: action.payload,
        testing: false,
      };

    default:
      return state;
  }
};

export default ChallengeReducer;
