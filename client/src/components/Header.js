import React from 'react';
import { Link } from 'react-router-dom';
import NavMenu from './NavMenu';
import '../styles/header.css';

const Header = () => (
  <header className="page-header">
    <NavMenu toggleType="img">
      <Link to="/">Home</Link>
      <Link to="/challenges">Challenges</Link>
    </NavMenu>
  </header>
);

export default Header;
