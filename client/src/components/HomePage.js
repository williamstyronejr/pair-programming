import React from 'react';
import './styles/homepage.css';

const HomePage = () => (
  <main className="page-main">
    <section className="home">
      <header className="home__header">
        <h1 className="home__heading">Pair program through challenges</h1>
        <p className="home__content">
          Pair up with other coders or a friend to complete challenges.
        </p>
      </header>
    </section>

    <section className="language">
      <h4 className="langauge__heading">Supported Langauage</h4>
      <div className="langauge__content">
        <ul className="langauge__list">
          <li className="language__item">
            <i className="devicon-javascript-plain language__icon">
              <div className="language__tooltip">Javascript</div>
            </i>
          </li>

          <li className="language__item">
            <i className="devicon-cplusplus-line language__icon language__icon--soon">
              <div className="language__tooltip">Coming Soon</div>
            </i>
          </li>

          <li className="language__item">
            <i className="devicon-python-plain language__icon language__icon--soon">
              <div className="language__tooltip">Coming Soon</div>
            </i>
          </li>
        </ul>
      </div>
    </section>

    <section className="info">
      <div className="info__grid">
        <div className="info__tile">
          <h5 clasName="info__heading">Upgrade your skills </h5>
          <p className="info__text">
            Challenge yourself with coding challenges to strengthen your
            knowledge.
          </p>
        </div>
        <div className="info__tile">
          <h5 clasName="info__heading">Collaborative with others</h5>
          <p className="info__text">
            Pair up with a random partner or a friend to tackle a challenge
            together with real-time pair programming.
          </p>
        </div>
        <div className="info__tile">
          <h5 clasName="info__heading">Compete</h5>
          <p className="info__text">Compete on a leaderboard.</p>
        </div>
      </div>
    </section>
  </main>
);

export default HomePage;
