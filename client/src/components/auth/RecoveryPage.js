import React, { Component } from 'react';
import axios from 'axios';

const Notification = props => (
  <div>
    <p>
      {props.text ||
        'If there is an account associated with the provided data, an email was sent.'}
    </p>
  </div>
);

const Loading = () => <div> loading </div>;

const Form = props => (
  <form onSubmit={props.onSubmit}>
    <input type="text" placeholder="username" onChange={props.onChange} />

    <input type="submit" />
  </form>
);

class RecoveryPage extends Component {
  state = { input: '', status: null };

  onSubmit = evt => {
    evt.preventDefault();
    this.setState({ status: 'loading' });

    axios
      .post('/account/recovery/password', { field: this.state.input })
      .then(res => {
        if (res.data.success) {
          this.setState({ status: 'finished' });
        }
      })
      .catch(err => {
        this.setState({ status: 'error' });
      });
  };

  /**
   * Redirect back to previous page, or homepage if none
   */
  onCancel = evt => {};

  onChange = evt => {
    this.setState({ input: evt.target.value });
  };

  render() {
    return (
      <div>
        {this.state.status === 'finished' && <Notification />}
        {this.state.status === 'loading' && <Loading />}
        {this.state.status === 'error' && (
          <Notification text="An server error has occurred. Please try again" />
        )}

        {this.state.status !== 'finished' && (
          <Form onChange={this.onChange} onSubmit={this.onSubmit} />
        )}
      </div>
    );
  }
}

export default RecoveryPage;
