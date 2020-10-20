import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import LoadingScreen from '../shared/LoadingScreen';
import Challenge from './Challenge';
import {
  getChallenge,
  setCode,
  convertRoomToPublic,
  testCode,
  clearData,
} from '../../actions/challenge';
import {
  setMessage,
  sendMessage,
  toggleChatVisibility,
} from '../../actions/chat';
import { openSocket } from '../../actions/socket';

class ChallengePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  // When component is mounting, grabbing challenge data
  componentDidMount() {
    // Grab challenge id and room id from URL
    const { rId, cId } = this.props.match.params;

    // Verify room info with server
    this.props.getChallenge(cId, rId);
  }

  // Handle initialing socket
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.props.challenge.private) {
      if (!this.props.chat.connected) {
        this.props.openSocket();
      } else if (!this.props.chat.roomJoined) {
        this.props.joinRoom(this.props.match.params.rId, this.props.username);
      }
    }
  }

  // Clear challenge data from Redux
  componentWillUnmount() {
    this.props.clearData();
  }

  render() {
    const { challenge, chat } = this.props;

    // Check if data has been loaded or if there was an error
    if (!challenge.title || challenge.challengeError) {
      return <LoadingScreen message={challenge.challengeError} />;
    }

    // Display loading message until chat is connected in public room
    if (!challenge.private && (!chat.connected || !chat.roomJoined)) {
      return <LoadingScreen message="Connection to chat" />;
    }

    return (
      <main className="page-main">
        <Challenge
          privateRoom={challenge.private}
          title={challenge.title}
          prompt={challenge.prompt}
          code={challenge.code}
          testing={challenge.testing}
          testPassed={challenge.testPassed}
          testErrors={challenge.testErrors}
          inviteLink={challenge.inviteLink}
          messages={chat.messages}
          chatInput={chat.chatInput}
          chatVisible={chat.visible}
          toggleChatVisibility={this.props.toggleChatVisibility}
          setMessage={this.props.setMessage}
          sendMessage={(msg) =>
            this.props.sendMessage(this.props.match.params.rId, msg)
          }
          setCode={(code) =>
            this.props.setCode(this.props.match.params.rId, code)
          }
          convertRoomToPublic={() =>
            this.props.convertRoomToPublic(this.props.match.params.rId)
          }
          testCode={(code) =>
            this.props.testCode(
              this.props.match.params.cId,
              this.props.match.params.rId,
              code
            )
          }
        />
      </main>
    );
  }
}

const mapStateToProps = (state) => ({
  challenge: state.challenge,
  chat: state.chat,
  username: state.user.username,
});

const mapDispatchToProps = (dispatch) => ({
  getChallenge: (cId, rId) => dispatch(getChallenge(cId, rId)),
  openSocket: () => dispatch(openSocket()),
  joinRoom: (id, username) =>
    dispatch({ type: 'join_room', payload: { room: id, username } }),
  setMessage: (text) => dispatch(setMessage(text)),
  sendMessage: (room, msg) => dispatch(sendMessage(room, msg)),
  toggleChatVisibility: () => dispatch(toggleChatVisibility()),
  setCode: (room, code) => dispatch(setCode(room, code)),
  convertRoomToPublic: (rId) => dispatch(convertRoomToPublic(rId)),
  testCode: (cId, rId, code) => dispatch(testCode(cId, rId, code)),
  clearData: () => dispatch(clearData()),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ChallengePage)
);
