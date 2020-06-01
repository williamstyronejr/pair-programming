import React from 'react';
import { Link } from 'react-router-dom';
import NavMenu from './NavMenu';

const AppHeader = (props) => (
  <header className="page-header">
    <NavMenu menuType="left">
      <Link to="/dashboard">Dashboard</Link>

      <button
        className="btn btn-signout"
        onClick={() => props.signout()}
        type="button"
      >
        Signout
      </button>
    </NavMenu>
  </header>
);

export default AppHeader;
