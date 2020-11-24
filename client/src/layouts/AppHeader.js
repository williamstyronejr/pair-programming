import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavMenu from '../components/shared/NavMenu';
import './styles/appHeader.css';

const AppHeader = (props) => {
  const [userMenu, setUserMenu] = useState(false);
  const [navMenu, setNavMenu] = useState(false);

  return (
    <header className="page-header">
      <NavMenu menuType="left">
        <Link to="/">Home</Link>
        <Link to="/challenges">Challenges</Link>
      </NavMenu>

      <div className="header__right">
        <div className="menu menu--collasped">
          <img
            className="menu__img menu__img--toggle "
            src={props.profileImage}
            alt="Profile Image"
            onClick={() => setUserMenu(!userMenu)}
            onKeyDown={(e) => (e.keyCode === 13 ? setUserMenu(!userMenu) : '')}
            tabIndex={0}
          />

          <div
            className={`menu__content ${
              userMenu ? 'menu__content--active' : ''
            }`}
            onBlur={(e) =>
              !e.currentTarget.contains(e.relatedTarget)
                ? setUserMenu(!userMenu)
                : ''
            }
          >
            <nav className="menu__nav">
              <ul className="menu__list">
                <li className="menu__item">
                  <Link className="menu__link" to="/settings">
                    Settings
                  </Link>
                </li>
                <hr className="menu__dividor" />
                <li className="menu__item">
                  <button
                    className="menu__link"
                    type="button"
                    onClick={() => props.signout()}
                  >
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
