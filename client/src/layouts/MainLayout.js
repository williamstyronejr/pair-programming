import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Header from '../components/Header';

class MainLayout extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.user.authenticated;
  }

  render() {
    if (this.props.user.authenticated && this.props.user.username)
      return <Redirect to="/dashboard" />;

    return (
      <div className="container">
        <Header />
        {this.props.children}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps, null)(MainLayout);
