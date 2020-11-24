import React from 'react';

const GithubButton = ({ signIn }) => (
  <div className="btn btn--social">
    <a
      className="github-link"
      href="http://localhost:5000/auth/github/callback"
    >
      <span className="flex-wrapper flex-wrapper--center">
        <i className="github-logo devicon-github-plain-wordmark" />
        {signIn ? 'Sign in with Github' : 'Sign up with Github'}
      </span>
    </a>
  </div>
);

export default GithubButton;
