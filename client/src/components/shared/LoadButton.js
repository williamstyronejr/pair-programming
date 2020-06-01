import React, { Component } from 'react';

class LoadButton extends Component {
  /**
   * Lifecycle mehtod, update component only when loading prop changes
   * @param {object} nextProps
   * @param {object} nextState
   */
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.loading !== nextProps.loading
      || this.props.disabled !== nextProps.disabled) {
      return true;
    }

    return false;
  }

  render() {
    const classActive = (this.props.loading) ? 'btn-load-active' : '';
    return (
      <button
        className={`btn btn-load ${classActive} ${this.props.className}`}
        onClick={this.props.onClick}
        disabled={this.props.disabled || this.props.loading}
      >
        {this.props.text}
      </button>
    );
  }
}

LoadButton.defaultProps = {
  className: '',
  disabled: false,
  loading: false
};

export default LoadButton;
