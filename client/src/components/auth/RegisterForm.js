import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import {
  signupAsyncValidation,
  githubRegister,
} from '../../actions/authentication';

const field = ({
  className,
  input,
  label,
  placeholder,
  type,
  meta: { touched, error },
}) => (
  <div className={className}>
    <label htmlFor={label}>
      {touched && error && <span>{error}</span>}
      <input {...input} type={type} placeholder={placeholder} />
    </label>
  </div>
);

/**
 * Validation method for register form. Checks if user name
 * @param {Object} values Object containing
 * @return {Object} An object containing any errors with fields.
 */
function validateFields(values) {
  const errors = {};

  if (!values.username) {
    errors.username = 'Username is required';
  } else if (values.username.length < 4 || values.username.length > 16) {
    errors.username = 'Username must be between 4 and 16 characters';
  }

  return errors;
}

class RegisterForm extends Component {
  formSubmit = ({ username }) => {
    this.props.githubRegister(username);
  };

  render() {
    const { handleSubmit, submitting, pristine } = this.props;

    return (
      <form onSubmit={handleSubmit(this.formSubmit)}>
        <fieldset>
          <Field
            name="username"
            type="text"
            label="username"
            placeholder="Username"
            component={field}
          />
        </fieldset>
        <input type="submit" value="submit" disabled={submitting} />
      </form>
    );
  }
}

const Form = connect(null, {
  githubRegister,
})(RegisterForm);

export default reduxForm({
  form: 'githubRegister',
  validate: validateFields,
  asyncValidate: signupAsyncValidation,
  asyncBlurFields: ['username '],
})(Form);
