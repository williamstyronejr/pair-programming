import React, { useState } from 'react';
import { connect } from 'react-redux';
import { ajaxRequest } from '../../utils/utils';
import { Link, Redirect } from 'react-router-dom';
import './styles/settingsPage.css';

const AccountForm = ({ currentUsername, currentEmail, currentImage }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [notification, setNotification] = useState(null);

  const submitForm = (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    setNotification(false);
    setError({});

    const formData = new FormData();

    if (username) formData.append('username', username);
    if (email) formData.append('email', email);
    if (profileImage) formData.append('profileImage', profileImage);

    ajaxRequest('/settings/account', 'POST', formData, {
      headers: { 'content-type': 'multipart/form-data' },
    })
      .then((res) => {
        setSubmitting(false);
        if (res.data.success)
          return setNotification('Successfully updated user information.');
        setNotification('An error has occurred. Please try again.');
      })
      .catch((err) => {
        setSubmitting(false);
        if (err.response.status === 400) {
          setError(err.response.data.errors);
        }
      });
  };

  return (
    <form className="settings__form" onSubmit={submitForm}>
      <header className="settings__header">
        <p className="settings__notification">{notification}</p>
      </header>

      <fieldset className="settings__field">
        <label className="settings__label">
          <img
            src={currentImage ? `/img/${currentImage}` : ''}
            className="settings__image"
          />
          <input
            type="file"
            className="settings__input"
            name="profileImage"
            onChange={(evt) => setProfileImage(evt.target.files[0])}
          />
        </label>
      </fieldset>

      <fieldset className="settings__field">
        <label className="settings__label">
          <span className="settings__title">Username</span>
          <span className="settings__error">{error.username}</span>
          <input
            type="text"
            className="settings__input"
            name="username"
            value={username}
            placeholder={currentUsername}
            onChange={(evt) => setUsername(evt.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="settings__field">
        <label className="settings__label">
          <span className="settings__title">Email</span>
          <span className="settings__error">{error.email}</span>
          <input
            type="text"
            className="settings__input"
            name="email"
            value={email}
            placeholder={currentEmail}
            onChange={(evt) => setEmail(evt.target.value)}
          />
        </label>
      </fieldset>

      <button className="btn btn--submit" type="submit" disabled={submitting}>
        Update
      </button>
    </form>
  );
};

const PasswordForm = () => {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [notification, setNotification] = useState(null);

  const submitForm = (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    setNotification(null);
    setError({});

    ajaxRequest('/settings/password', 'POST', {
      password: currentPassword,
      newPassword,
      confirmPassword,
    })
      .then((res) => {
        setSubmitting(false);
        if (res.data.success) {
          setCurrent('');
          setNew('');
          setConfirm('');
          setNotification('Successfully updated password.');
        }
      })
      .catch((err) => {
        setSubmitting(false);
        if (err.response.status === 400)
          return setError(err.response.data.errors);
        setNotification('An error has occurred. Please try again.');
      });
  };

  return (
    <form className="settings__form" onSubmit={submitForm}>
      <header className="settings__header">
        <p className="settings__notification">{notification}</p>
      </header>

      <fieldset className="settings__field">
        <label className="settings__label">
          <span className="settings__title">Current Password</span>
          <span className="settings__error">{error.password}</span>
          <input
            type="password"
            className="settings__input"
            name="password"
            value={currentPassword}
            onChange={(evt) => setCurrent(evt.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="settings__field">
        <label className="settings__label">
          <span className="settings__title">New Password</span>
          <span className="settings__error">{error.newPassword}</span>
          <input
            type="password"
            className="settings__input"
            name="newPassword"
            value={newPassword}
            onChange={(evt) => setNew(evt.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="settings__field">
        <label className="settings__label">
          <span className="settings__title">Confirm Password</span>
          <span className="settings__error">{error.confirmPassword}</span>
          <input
            type="password"
            className="settings__input"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(evt) => setConfirm(evt.target.value)}
          />
        </label>
      </fieldset>

      <button className="btn btn--submit" type="submit" disabled={submitting}>
        Update
      </button>
    </form>
  );
};

const SettingsPage = (props) => {
  const { type } = props.match.params;
  let displayedForm;

  switch (type) {
    case 'account':
      displayedForm = (
        <AccountForm
          currentUsername={props.user.username}
          currentEmail={props.user.email}
          currentImage={props.user.profileImage}
        />
      );
      break;
    case 'password':
      displayedForm = <PasswordForm />;
      break;

    default:
      displayedForm = <Redirect to="/settings/account" />;
  }

  return (
    <main className="page-main">
      <section className="settings">
        <aside className="settings__links">
          <ul className="settings__list">
            <li className="settings__item">
              <Link
                className={`settings__link ${
                  type === 'account' ? 'settings__link--active' : ''
                }`}
                to="/settings/account"
              >
                Account
              </Link>
            </li>

            <li className="settings__item">
              <Link
                className={`settings__link ${
                  type === 'password' ? 'settings__link--active' : ''
                }`}
                to="/settings/password"
              >
                Password
              </Link>
            </li>
          </ul>
        </aside>

        <div className="settings__content">{displayedForm}</div>
      </section>
    </main>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps, null)(SettingsPage);
