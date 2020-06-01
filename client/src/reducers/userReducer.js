const initState = {
  profileImage: null,
  id: null,
  username: '',
  email: '',
  authenticated: false,
  authenticating: false,
  authError: '',
};

const userReducer = (state = initState, action) => {
  switch (action.type) {
    case 'GETTING_USER_DATA':
      return {
        ...state,
        authenticating: true,
      };

    case 'AUTH_USER':
      return {
        ...state,
        authenticated: true,
        authError: '',
      };

    case 'UNAUTH_USER':
      return {
        ...initState,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        authenticated: false,
        authenticating: false,
        authError: action.payload,
      };

    case 'SET_USER_DATA':
      return {
        ...state,
        id: action.payload._id,
        username: action.payload.username,
        profileImage: action.payload.profileImage,
        email: action.payload.email,
        authenticating: false,
        authenticated: true,
        authError: null,
      };

    default:
      return state;
  }
};

export default userReducer;
