import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { ajaxRequest } from '../../utils/utils';
import { setUserData } from '../../actions/authentication';
import './styles/signupPage.css';

const SignupPage = (props) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(false);

  if (props.user.authenticated) return <Redirect to="/dashboard" />;

  function registerUser() {
    if (status === 'sending') return;

    setStatus('sending');

    ajaxRequest('/signup', 'POST', {
      username: user,
      password,
      confirm,
      email,
    })
      .then((res) => {
        if (res.data.success) {
          props.setUserData(res.data.user);
          setStatus('');
        }
      })
      .catch((err) => {
        if (err.response.body) return setError(err.response.body);
        setError(true);
      });
  }

  return (
    <main className="page-main">
      <section className="signup">
        <header className="signup__header">
          <h4 className="signup__heading">signup</h4>
        </header>

        <div className="signup__form">
          {error && (
            <div className="signup__error">
              <p className="signup__warning">Invalid username or password</p>
            </div>
          )}

          <div className="signup__field">
            <label className="signup__label" htmlFor="user">
              Email
              <input
                className="signup__input"
                type="text"
                data-cy="email"
                name="email"
                value={email}
                onChange={(evt) => setEmail(evt.target.value)}
              />
            </label>
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="user">
              Username
              <input
                className="signup__input"
                type="text"
                data-cy="user"
                name="user"
                value={user}
                onChange={(evt) => setUser(evt.target.value)}
              />
            </label>
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="user">
              Password
              <input
                className="signup__input"
                type="password"
                data-cy="password"
                name="password"
                value={password}
                onChange={(evt) => setPassword(evt.target.value)}
              />
            </label>
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="user">
              Password
              <input
                className="signup__input"
                type="password"
                data-cy="confirm"
                name="confirm"
                value={confirm}
                onChange={(evt) => setConfirm(evt.target.value)}
              />
            </label>
          </div>

          <button
            className="btn btn-submit"
            type="button"
            disabled={status === 'sending'}
            onClick={registerUser}
          >
            signup
          </button>
        </div>
      </section>
    </main>
  );
};

const mapStatesToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  setUserData: (user) => dispatch(setUserData(user)),
});

export default connect(mapStatesToProps, mapDispatchToProps)(SignupPage);
