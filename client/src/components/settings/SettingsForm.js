import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import axios from 'axios';
import FieldFileInput from '../shared/fieldFileInput';
import FieldInput from '../shared/fieldInput';
import Notification from '../shared/notification';

class SettingsForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notificationVisible: false,
      notificationMessage: null
    };
  }

  formSubmit = data => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    axios
      .post('/user/settings/update', formData, {
        headers: { 'content-type': 'multipart/form-data' }
      })
      .then(res => {
        this.setState({
          notificationVisible: true,
          notificationMessage: 'Settings updated'
        });
      })
      .catch(err => {
        this.setState({
          notificationVisible: true,
          notificationMessage: 'An error occurred, please try again'
        });
      });
  };

  render() {
    const { handleSubmit, submitting, pristine } = this.props;

    return (
      <React.Fragment>
        {this.state.notificationVisible && (
          <Notification message={this.state.notificationMessage} />
        )}
        <form className="signin-form" onSubmit={handleSubmit(this.formSubmit)}>
          <fieldset className="">
            <Field
              className="signin-form__field"
              name="profile"
              label="profile"
              type="file"
              component={FieldFileInput}
            />

            <Field
              className="signin-form__field"
              name="username"
              label="username"
              type="text"
              defaultValue={this.props.username}
              component={FieldInput}
            />
          </fieldset>

          <fieldset>
            <Field
              className="signin-form__field"
              name="password"
              label="password"
              type="password"
              component={FieldInput}
            />
          </fieldset>

          <fieldset>
            <Field
              className="signin-form__field"
              name="email"
              label="email"
              type="text"
              defaultValue={this.props.email}
              component={FieldInput}
            />
          </fieldset>

          <input
            className="btn btn-submit"
            type="submit"
            value="Update Profile"
            disabled={submitting}
          />
        </form>
      </React.Fragment>
    );
  }
}

const Form = connect(
  null,
  {}
)(SettingsForm);

export default reduxForm({
  form: 'settings'
})(Form);
