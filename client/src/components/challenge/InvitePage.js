import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import LoadingScreen from '../shared/LoadingScreen';

class InvitePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      link: '',
      loading: true,
    };
  }

  /**
   * Handles making request to get room location. Will redirect if error:
   * Unauthorized (401): Redirect to signin with query to redirect to this page
   * Server error (500): Redirect to Home (or to 500 error page)
   */
  componentDidMount() {
    axios
      .post(this.props.location.pathname, {
        inviteKey: this.props.match.params.key,
      })
      .then((res) => {
        this.setState({
          link: res.data.link,
          loading: false,
        });
      })
      .catch((err) => {
        const { status } = err.response;
        const link = status === 401 ? '/signin' : '/';

        this.setState({
          link,
          loading: false,
        });
      });
  }

  render() {
    if (!this.state.loading) {
      return <Redirect to={this.state.link} />;
    }

    return (
      <main className="page-main">
        <LoadingScreen />
      </main>
    );
  }
}

export default InvitePage;
