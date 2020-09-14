import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { openSocket, closeSocket } from '../../actions/socket';
import { Timer } from '../shared/Timer';
import {
  joinQueue,
  leaveQueue,
  acceptMatch,
  declineMatch,
  clearQueue,
  matchTimeout,
} from '../../actions/queue';

class ChallengeQueuePage extends Component {
  componentDidMount() {
    if (
      this.props.user.id &&
      !this.props.socket.connected &&
      !this.props.socket.connecting
    ) {
      this.props.openSocket();
    }
  }

  componentDidUpdate() {
    // Check if queue timer has gone over
    if (this.props.queue.acceptTimer >= 8) {
      if (this.props.queue.acceptedMatch && !this.props.queue.roomId) {
        return this.props.clearQueue(); // Clearing queue
      } else if (
        !this.props.queue.acceptedMatch &&
        !this.props.queue.declinedMatch
      ) {
        return this.props.matchTimeout();
      }
    }

    // Check if user has already left queue
    if (!this.props.queue.leaveQueue) {
      if (
        this.props.user.id &&
        !this.props.socket.connected &&
        !this.props.socket.connecting
      ) {
        this.props.openSocket();
      } else if (this.props.socket.connected) {
        // Add user to queue when socket is ready
        if (this.props.socket.ready && !this.props.queue.inQueue) {
          this.props.joinQueue(this.props.match.params.cId, 2);
        }
      }
    }
  }

  componentWillUnmount() {
    this.props.closeSocket();
    this.props.clearQueue();
  }

  render() {
    const {
      leaveQueue,
      roomId,
      matchFound,
      acceptedMatch,
      declinedMatch,
    } = this.props.queue;
    let statusMessage;

    if (leaveQueue) {
      statusMessage = <Redirect to="/dashboard" />;
    } else if (roomId) {
      statusMessage = (
        <Redirect to={`/c/${this.props.match.params.cId}/r/${roomId}`} />
      );
    } else if (matchFound && !acceptedMatch && !declinedMatch) {
      statusMessage = (
        <>
          <h2>Pair Found</h2>
          <button
            type="button"
            onClick={() => this.props.acceptMatch(this.props.queue.matchId)}
          >
            Accept Pair
          </button>
          <button type="button" onClick={this.props.declineMatch}>
            Decline Pair
          </button>
        </>
      );
    } else {
      statusMessage = (
        <>
          <h2 className="queue__status">In Queue</h2>
        </>
      );
    }

    return (
      <main className="page-main">
        <section className="page-section__center">
          {statusMessage}
          <Timer
            isPaused={
              (matchFound && !acceptedMatch && !declinedMatch) || acceptedMatch
            }
          />
          <div>
            <button
              type="button"
              onClick={() =>
                this.props.leaveQueue(
                  this.props.user.id,
                  this.props.match.params.cId
                )
              }
            >
              Cancel
            </button>
          </div>
        </section>
      </main>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  queue: state.queue,
  socket: state.socket,
});

const mapDispatchToProps = (dispatch) => ({
  openSocket: () => dispatch(openSocket()),
  closeSocket: () => dispatch(closeSocket()),
  clearQueue: () => dispatch(clearQueue()),
  declineMatch: () => dispatch(declineMatch()),
  joinQueue: (cId, size) => dispatch(joinQueue(cId, size)),
  leaveQueue: (uId, cId) => dispatch(leaveQueue(uId, cId)),
  acceptMatch: (queueId) => dispatch(acceptMatch(queueId)),
  matchTimeout: () => dispatch(matchTimeout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChallengeQueuePage);
