import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import GithubButton from './GithubButton';
import { setUserData } from '../../actions/authentication';
import { ajaxRequest } from '../../utils/utils';
import './styles/signinPage.css';

const SigninPage = (props) => {
  const [username, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(false);

  if (props.user.authenticated) return <Redirect to="/challenges" />;

  function signUserIn() {
    if (status === 'sending') return;
    setStatus('sending');
    setError(false);

    ajaxRequest('/signin', 'POST', { username, password })
      .then((res) => {
        if (res.data.success) {
          props.setUserData(res.data.user);
          setStatus('');
        }
      })
      .catch((err) => {
        setStatus('');
        setError(true);
      });
  }

  return (
    <main className="page-main">
      <section className="signin">
        <div className="signin__form">
          <header className="signin__header">
            <h1 className="signin__heading">Sign in to your account</h1>

            <GithubButton signIn />

            <div className="signin__separator">
              <hr />
              <span>Or</span>
              <hr />
            </div>
          </header>

          {error && (
            <div className="signin__error">
              <p className="signin__warning">Invalid username or password</p>
            </div>
          )}

          <div className="signin__field">
            <label className="signin__label" htmlFor="user">
              <span className="signin__title">Username</span>
              <input
                className="signin__input"
                type="text"
                data-cy="user"
                name="user"
                placeholder="Username"
                value={username}
                onChange={(evt) => setUser(evt.target.value)}
              />
            </label>
          </div>

          <div className="signin__field">
            <label className="signin__label" htmlFor="user">
              Password
              <input
                className="signin__input"
                type="password"
                data-cy="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(evt) => setPassword(evt.target.value)}
              />
            </label>
          </div>

          <button
            className="btn btn--submit btn--small"
            type="button"
            disabled={status === 'sending'}
            onClick={signUserIn}
          >
            Signin
          </button>
        </div>
      </section>
    </main>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  setUserData: (user) => dispatch(setUserData(user)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SigninPage);
