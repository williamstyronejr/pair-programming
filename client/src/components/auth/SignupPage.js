import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { ajaxRequest } from '../../utils/utils';
import { setUserData } from '../../actions/authentication';
import GithubButton from './GithubButton';
import './styles/signupPage.css';

const SignupPage = (props) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(false);

  if (props.user.authenticated) return <Redirect to="/challenges" />;

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
        if (err && err.response.body) return setError(err.response.body);
        setError(true);
      });
  }

  return (
    <main className="page-main">
      <section className="signup">
        <div className="signup__form">
          <header className="signup__header">
            <h1 className="signup__heading">Create your account</h1>

            <GithubButton />

            <div className="signup__separator">
              <hr />
              <span>Or</span>
              <hr />
            </div>
          </header>

          <div className="signup__field">
            <label className="signup__label" htmlFor="user">
              <span className="signup__title">Email</span>

              {error && error.email && (
                <span className="signup__fielderror">{error.email}</span>
              )}
              <input
                className="signup__input"
                type="text"
                data-cy="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(evt) => setEmail(evt.target.value)}
              />
            </label>
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="user">
              <span className="signup__title">Username</span>

              {error && error.username && (
                <span className="signup__fielderror">{error.username}</span>
              )}
              <input
                className="signup__input"
                type="text"
                data-cy="user"
                name="user"
                placeholder="Username"
                value={user}
                onChange={(evt) => setUser(evt.target.value)}
              />
            </label>
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="password">
              <span className="signup__title">Password</span>

              {error && error.password && (
                <span className="signup__fielderror">{error.password}</span>
              )}
              <input
                className="signup__input"
                type="password"
                data-cy="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(evt) => setPassword(evt.target.value)}
              />
            </label>
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="confirm">
              <span className="signup__title">Confirm Password</span>
              {error && error.confirm && (
                <span className="signup__fielderror">{error.confirm}</span>
              )}
              <input
                className="signup__input"
                type="password"
                data-cy="confirm"
                name="confirm"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(evt) => setConfirm(evt.target.value)}
              />
            </label>
          </div>

          <button
            className="btn btn--submit btn--small"
            type="button"
            disabled={status === 'sending'}
            onClick={registerUser}
          >
            Sign Up
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
