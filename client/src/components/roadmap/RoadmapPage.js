import React from 'react';
import './styles/roadmapPage.css';

const RoadmapPage = () => (
  <main className="page-main">
    <section className="roadmap">
      <header className="roadmap__header">
        <h2 className="roadmap__heading">Product Roadmap</h2>
      </header>

      <div className="roadmap__content">
        <div className="roadmap__group">
          <h4 className="roadmap__title">General</h4>

          <ul className="roadmap__list">
            <li className="roadmap__item">
              <div className="roadmap__checkbox" />
              <span className="roadmap__task">Darkmode</span>
            </li>
            <li className="roadmap__item">
              <div className="roadmap__checkbox" />
              <span className="roadmap__task">Profile</span>
            </li>
          </ul>
        </div>

        <div className="roadmap__group">
          <h4 className="roadmap__title">Languages</h4>

          <ul className="roadmap__list">
            <li className="roadmap__item">
              <div className="roadmap__checkbox roadmap__checkbox--active" />
              <span className="roadmap__task">Javascript</span>
            </li>
            <li className="roadmap__item">
              <div className="roadmap__checkbox" />
              <span className="roadmap__task">C++</span>
            </li>
            <li className="roadmap__item">
              <div className="roadmap__checkbox" />
              <span className="roadmap__task">Python</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </main>
);

export default RoadmapPage;
