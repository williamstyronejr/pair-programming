import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { ajaxRequest } from '../../utils/utils';
import LoadingComponent from '../shared/Loading';
import './styles/challengeList.css';

class ChallengeList extends Component {
  constructor(props) {
    super(props);

    this.getChallenges = this.getChallenges.bind(this);

    this.state = {
      page: 0,
      endOfList: false,
      challenges: [],
      loadingList: false,
      listError: null,
      creatingRoom: false,
      roomError: null,
    };
  }

  componentDidMount() {
    if (this.state.challenges.length === 0) {
      // No challenges loaded, grab challenges
      this.getChallenges(0);
    }
  }

  getChallenges() {
    const { loadingList, page } = this.state;
    // Stops from sending multiple request to update
    if (loadingList) return;

    this.setState({ loadingList: true });

    ajaxRequest(`/challenge/list?page=${page}`, 'GET')
      .then((res) => {
        // If list is empty, set end of list to be true
        if (res.data.length === 0) {
          return this.setState({ endOfList: true, loadingList: false });
        }

        this.setState({
          page: this.state.page + 1,
          challenges: [...this.state.challenges, ...res.data],
          loadingList: false,
        });
      })
      .catch((err) => {
        this.setState({ listError: true, loadingList: false });
      });
  }

  createPrivateRoom(cId) {
    this.setState({ creatingRoom: true });

    ajaxRequest(`/challenge/${cId}/create`, 'POST')
      .then((res) => {
        if (!res.data.room) {
          return this.setState({ roomError: true });
        }
        // Redirect user to room page
        this.props.history.push(`/c/${cId}/r/${res.data.room}`);
      })
      .catch((err) => {
        this.setState({ roomError: true, creatingRoom: false });
      });
  }

  render() {
    const { endOfList, challenges } = this.state;

    // Displays loading indicator
    if (challenges.length === 0) {
      return <LoadingComponent error={endOfList} />;
    }

    const listItems = challenges.map((challenge, index) => (
      <>
        <li className="challenge-list__item" key={`challenge-${challenge._id}`}>
          <div className="challenge-list__details">
            <h3 className="challenge-list__title">{challenge.title}</h3>
            <ul className="challenge-list__tags">
              {challenge.tags.split(',').map((tag) => (
                <li className="challenge-list__tag">{tag.trim()}</li>
              ))}
            </ul>
          </div>

          <div className="challenge-list__options">
            <Link className="challenge-list__link" to={`/c/${challenge._id}`}>
              Pair Up
            </Link>

            <button
              type="button"
              className="challenge-list__link"
              onClick={() => this.createPrivateRoom(challenge._id)}
            >
              Solo
            </button>
          </div>
        </li>
      </>
    ));

    return (
      <section className="challenge-list">
        <ul className="challenge-list">
          <InfiniteScroll
            pageStart={0}
            loadMore={this.getChallenges}
            hasMore={!endOfList}
            loader={<LoadingComponent />}
          >
            {listItems}
          </InfiniteScroll>
        </ul>
      </section>
    );
  }
}

export default withRouter(ChallengeList);
