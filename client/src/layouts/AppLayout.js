import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Header from './AppHeader';
import { signoutUser } from '../actions/authentication';

/**
 *  General app layout, handles redirecting user if not authenticated.
 */
class AppLayout extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      !nextProps.user.authenticated ||
      this.props.user.profileImage !== nextProps.user.profileImage
    );
  }

  render() {
    if (!this.props.user.authenticated && !this.props.user.authenticating) {
      return <Redirect to="/signin" />;
    } else if (this.props.user.authenticated && !this.props.user.username) {
      return <Redirect to="/account/register" />;
    }

    let profileImage;
    if (!this.props.user.profileImage) {
      profileImage = '/img/default.jpg';
    } else {
      console.log(this.props.user.profileImage);
      profileImage = this.props.user.profileImage.includes('https://')
        ? `${this.props.user.profileImage}`
        : `/img/${this.props.user.profileImage}`;
    }

    return (
      <>
        <Header
          signout={this.props.signoutUser}
          username={this.props.user.username}
          profileImage={profileImage}
        />
        {this.props.children}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  signoutUser: () => dispatch(signoutUser()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppLayout);
