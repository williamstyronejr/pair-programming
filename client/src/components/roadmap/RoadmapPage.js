import React from 'react';
import './styles/roadmapPage.css';

const RoadmapPage = () => (
  <main className="page-main">
    <section className="roadmap">
      <header className="roadmap__header">
        <h2 className="roadmap__heading">Product Roadmap</h2>
      </header>

      <div className="roadmap__content">
        <ul className="roadmap__list">
          <li className="roadmap__item roadmap__item--divider">
            <h4 className="roadmap__title">Languages</h4>
          </li>
          <li className="roadmap__item">Javascript</li>
        </ul>
      </div>
    </section>
  </main>
);

export default RoadmapPage;
