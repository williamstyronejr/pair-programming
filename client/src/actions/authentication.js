import axios from 'axios';

// Action types
export const AUTHUSER = 'auth_user';
export const UNAUTHUSER = 'unauth_user';
export const AUTHERROR = 'auth_error';
export const SETUSERDATA = 'set_user_data';
export const GETUSERDATA = 'get_user_data';

function authUser() {
  return {
    type: 'AUTH_USER',
  };
}

function unauthUser() {
  return {
    type: 'UNAUTH_USER',
  };
}

function authError(error) {
  return {
    type: 'AUTH_ERROR',
    payload: error,
  };
}

export function setUserData(data) {
  return {
    type: 'SET_USER_DATA',
    payload: data,
  };
}

function authenticatingUser() {
  return {
    type: 'GETTING_USER_DATA',
  };
}

/**
 * Validates username and email for signup form by ajax request server to check
 *  for uniqueness.
 * @param {object} values Object containing form values from redux-form
 * @return {Promise} Returns a promise that returns uniquiness errors to the server.
 */
export function signupAsyncValidation(values) {
  return axios.post('/inputvalidator', values).catch((err) => {
    // If invalid input error occurs, throw error for redux form to catch
    if (err.response.status === 400) {
      throw err.response.data.errors;
    }
  });
}

/**
 * Sends request to authenticate the user. If successful, token will be saved
 *  in cookie and update auth state, otherwise update auth state with error.
 * @param {string} username Username for user signing in
 * @param {string} password Password for user signing in
 * @return {Function} Returns a redux thunk action to dispatch redux action.
 */
export function signinUser(username, password) {
  return (dispatch) => {
    axios
      .post('/signin', { username, password })
      .then((res) => dispatch(getUserData()))
      .catch((error) =>
        dispatch(authError('Invalid username and/or password'))
      );
  };
}

/**
 * Sends ajax requet to sign user up. If successful, then token will be stored
 *  in cookie and redirect user to dashboard. Otherwise, update state with error.
 * @param {string} username Username user is trying to signup with
 * @param {string} email Email user is trying to signup with
 * @param {string} password Password user is trying to signup with
 * @return {Function} Returns a redux thunk action to dispatch redux action
 */
export function signUpUser(username, email, password) {
  return (dispatch) => {
    axios
      .post('/signup', { username, email, password })
      .then((res) => dispatch(authUser()))
      .catch((err) => {
        if (err.response.status === 400) {
          // Invalid inputs
          return dispatch(authError(err.response.data));
        }

        dispatch(
          authError(
            'An error occurred with creating your account. Please try again.'
          )
        );
      });
  };
}

/**
 * Sends ajax request to sign user out, removing user's cookie. If successful,
 *  dispatch unauthenticate action.
 * @return {Function} Redux thunk action to dispatch redux action
 */
export function signoutUser() {
  return (dispatch) => {
    axios.post('/signout').then((res) => dispatch(unauthUser()));
  };
}

/**
 * Sends ajax request to register a github user a username.
 * @param {String} username Username to register user under
 * @return {Function} Redux thunk action to dispatch redux action
 */
export function githubRegister(username) {
  return (dispatch) => {
    axios
      .post('/account/register', { username })
      .then((res) => dispatch(getUserData()))
      .catch((err) => {
        dispatch(
          authError(
            'An error occurred with creating your account. Please try again.'
          )
        );
      });
  };
}

/**
 * Send ajax request to get user data. If successful, then store user data in
 *  redux. Otherwise, unauthenticate the user.
 * @return {Function} Redux thunk action to dispatch redux action
 */
export function getUserData() {
  return (dispatch) => {
    dispatch(authenticatingUser());
    axios
      .get('/user/data')
      .then((res) => dispatch(setUserData(res.data)))
      .catch((err) => dispatch(unauthUser()));
  };
}
