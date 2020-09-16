import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Header from './AppHeader';
import { signoutUser } from '../actions/authentication';

/**
 *  General app layout, handles redirecting user if not authenticated.
 */
const AppLayout = (props) => {
  if (!props.user.authenticated && !props.user.authenticating) {
    return <Redirect to="/signin" />;
  } else if (props.user.authenticated && !props.user.username) {
    return <Redirect to="/account/register" />;
  }

  let profileImage;
  if (!props.user.profileImage) {
    profileImage = '/img/default.jpg';
  } else {
    profileImage = props.user.profileImage.includes('https://')
      ? `${props.user.profileImage}`
      : `/img/${props.user.profileImage}`;
  }

  return (
    <>
      <Header
        signout={props.signoutUser}
        username={props.user.username}
        profileImage={profileImage}
      />
      {props.children}
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  signoutUser: () => dispatch(signoutUser()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppLayout);
