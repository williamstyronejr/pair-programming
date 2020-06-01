import React, { Component } from 'react';
import { connect } from 'react-redux';
import SettingsForm from './SettingsForm';

class SettingsPages extends Component {
  // Allow user to edit username, email, password, (etc account settings)
  state = {};

  render() {
    return (
      <main className="page-main">
        <SettingsForm
          username={this.props.user.username}
          email={this.props.user.email}
        />
      </main>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps, null)(SettingsPages);
