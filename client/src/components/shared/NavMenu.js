import React, { Component } from 'react';
import './styles/navMenu.css';

/**
 * Menu types:
 *  left
 *  right
 *  mini - Menu icon
 */
class NavMenu extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.state = {
      toggle: false,
    };
  }

  onKeyDown(evt) {
    const code = evt.keyCode ? evt.keyCode : evt.which;
    if (code === 13 || code === 32) {
      this.toggle();
    }
  }

  /**
   * Toggles the state to show/hide nav on smaller screens
   */
  toggle() {
    this.setState({ toggle: !this.state.toggle });
  }

  render() {
    const list = this.props.children.map((elem) => (
      <li className="nav-list__item">{elem}</li>
    ));

    const menuType = this.props.menuType || 'left';
    const active = this.state.toggle ? '-active' : '';
    const collapsed = this.props.isCollapsed
      ? 'menu-collapsed'
      : 'menu-collapsable';
    let toggleDiv; // Holds the div for menu toggle

    // Create toggle based on type
    if (this.props.toggleType === 'img') {
      toggleDiv = (
        <div className="nav-toggle__img">
          <img src={this.props.imgURL} alt="Profile" />
        </div>
      );
    } else {
      toggleDiv = (
        <div className="toggle-ham">
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
        </div>
      );
    }

    return (
      <div className={`menu ${collapsed} menu-${menuType + active}`}>
        <div
          className={`nav-toggle nav-toggle-${this.props.toggleType}`}
          onClick={this.toggle}
          onKeyDown={this.onKeyDown}
          role="button"
          tabIndex="0"
        >
          {toggleDiv}
        </div>

        <nav className="nav">
          <ul className="nav-list">{list}</ul>
        </nav>
      </div>
    );
  }
}

export default NavMenu;
