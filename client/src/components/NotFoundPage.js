import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="container">
    <main className="page-main">
      <section className="flex-wrapper flex-center">
        <h2>404 Error - Page Not Found</h2>
        <p>This page does not exists or has been moved.</p>
        <Link to="/">Go Back Home</Link>
      </section>
    </main>
  </div>
);

export default NotFoundPage;
