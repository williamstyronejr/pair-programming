import React, { useState, useEffect } from 'react';
import { Link, withRouter } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { ajaxRequest } from '../../utils/utils';
import LoadingComponent from '../shared/Loading';
import './styles/challengeList.css';

const ChallengeListPage = (props) => {
  const [page, setPage] = useState(0);
  const [endOfList, setEndOfList] = useState(false);
  const [challenges, setChallenge] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomError, setRoomError] = useState(null);

  useEffect(() => {
    if (challenges.length === 0) getChallenges(0);
  }, []);

  const getChallenges = () => {
    if (loadingList) return; // Stops from sending multiple request to update

    setLoadingList(true);

    ajaxRequest(`/challenge/list?page=${page}`, 'GET')
      .then((res) => {
        // If list is empty, set end of list to be true
        if (res.data.challenges.length === 0) {
          setEndOfList(true);
          return setLoadingList(false);
        }

        setPage(page + 1);
        setChallenge([...challenges, ...res.data.challenges]);
        setLoadingList(false);
      })
      .catch((err) => {
        setListError(true);
        setLoadingList(false);
      });
  };

  const createPrivateRoom = (cId) => {
    if (creatingRoom) return; // Stop user from creating multiple rooms at once
    setCreatingRoom(true);

    ajaxRequest(`/challenge/${cId}/create`, 'POST')
      .then((res) => {
        console.log(res.data);
        if (!res.data.room) {
          setRoomError(true);
        }
        // Redirect user to room page
        props.history.push(`/c/${cId}/r/${res.data.room}`);
      })
      .catch((err) => {
        setRoomError(true);
        setCreatingRoom(false);
      });
  };

  // Displays loading indicator
  if (challenges.length === 0) {
    return <LoadingComponent error={endOfList} />;
  }

  const listItems = challenges.map((challenge) => (
    <>
      <li className="challenge-list__item" key={`challenge-${challenge._id}`}>
        <div className="challenge-list__details">
          <h3 className="challenge-list__title">{challenge.title}</h3>
          <p className="challenge-list__prompt">{challenge.prompt}</p>
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
            onClick={() => createPrivateRoom(challenge._id)}
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
          loadMore={getChallenges}
          hasMore={!endOfList}
          loader={<LoadingComponent />}
        >
          {listItems}
        </InfiniteScroll>
      </ul>
    </section>
  );
};

export default withRouter(ChallengeListPage);
