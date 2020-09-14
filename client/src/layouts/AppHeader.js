import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavMenu from '../components/NavMenu';
import './styles/appHeader.css';

const AppHeader = (props) => {
  const [userMenu, setUserMenu] = useState(false);
  const [navMenu, setNavMenu] = useState(false);

  return (
    <header className="page-header">
      <NavMenu menuType="left">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </NavMenu>

      <div className="header__right">
        <div className="menu menu--collasped">
          <img
            className="menu__img menu__img--toggle "
            src={props.profileImage}
            alt="Profile Image"
            onClick={() => setUserMenu(!userMenu)}
          />

          <div
            className={`menu__content ${
              userMenu ? 'menu__content--active' : ''
            }`}
          >
            <nav className="menu__nav">
              <ul className="menu__list">
                <hr className="menu__dividor" />
                <li className="menu__item">
                  <button className="menu__link" onClick={() => props.signout}>
                    Signout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
