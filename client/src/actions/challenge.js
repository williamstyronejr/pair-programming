import axios from 'axios';

// Action types
export const SET_CHALLENGE_DATA = 'set_challenge_data';
export const SET_CHALLENGE_ERROR = 'set_challenge_error';
export const CLEAR_CHALLENGE_DATA = 'clear_challenge_data';
export const SET_CODE = 'set_code';
export const ADD_INVITE_LINK = 'add_invite_link';
export const TEST_CODE = 'test_code';
export const TEST_FINISH = 'test_finish';

// Action handlers
function setData(data) {
  return {
    type: SET_CHALLENGE_DATA,
    payload: data,
  };
}

function challengeError(error) {
  return {
    type: SET_CHALLENGE_ERROR,
    payload: error,
  };
}

export function clearData() {
  return {
    type: CLEAR_CHALLENGE_DATA,
  };
}

export function setCode(room, code) {
  return {
    type: SET_CODE,
    payload: { room, code },
  };
}

export function addInvite(inviteLink) {
  return {
    type: ADD_INVITE_LINK,
    payload: inviteLink,
  };
}

export function testingCode() {
  return {
    type: TEST_CODE,
  };
}

export function getChallenge(cId, rId) {
  return (dispatch) => {
    axios
      .get(`/challenge/${cId}/room/${rId}`)
      .then((res) => {
        if (res.data.error) {
          dispatch(challengeError(res.data.error));
        } else {
          dispatch(setData(res.data));
        }
      })
      .catch((err) => {
        dispatch(challengeError(err.response.data));
      });
  };
}

export function convertRoomToPublic(rId) {
  return (dispatch) => {
    axios
      .post(`/room/${rId}/public`)
      .then((res) => {
        dispatch(addInvite(res.data.invite));
      })
      .catch((err) => {
        dispatch(challengeError(err.response.data));
      });
  };
}

/**
 * Sends a request for the code to be tested along with the current local
 *  parameters.
 * @param {String} cId Id of challenge
 * @param {String} rId Id of room
 * @param {String} code Code for the challenge
 * @param {String} language Programming language the challenge is in
 * @return {Function} Returns a redux
 */
export function testCode(cId, rId, code, language) {
  return (dispatch) => {
    dispatch(testingCode());
    axios
      .post(`/challenge/${cId}/room/${rId}/test`, { code, language })
      .catch((err) => {
        dispatch(challengeError(err.response.data));
      });
  };
}
