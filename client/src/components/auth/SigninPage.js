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

  if (props.user.authenticated) return <Redirect to="/dashboard" />;

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
        <header className="signin__header">
          <h4 className="signin__heading">Signin</h4>
        </header>

        <div className="signin__form">
          {error && (
            <div className="signin__error">
              <p className="signin__warning">Invalid username or password</p>
            </div>
          )}

          <div className="signin__field">
            <label className="signin__label" htmlFor="user">
              Username
              <input
                className="signin__input"
                type="text"
                data-cy="user"
                name="user"
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
                value={password}
                onChange={(evt) => setPassword(evt.target.value)}
              />
            </label>
          </div>

          <button
            className="btn btn-submit"
            type="button"
            disabled={status === 'sending'}
            onClick={signUserIn}
          >
            Signin
          </button>
        </div>
      </section>

      <GithubButton />
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
