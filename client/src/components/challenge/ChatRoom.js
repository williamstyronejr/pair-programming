import React, { Component } from 'react';
import ChatIcon from '../shared/ChatIcon';
import './styles/chatRoom.css';

class ChatRoom extends Component {
  onChange = (e) => {
    this.props.setMessage(e.target.value);
  };

  // When user hits enter (without shift), send current message
  onKeyDown = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault(); // Stop '\n' from being put in form

      // Prevent sending empty message (spaces work)
      if (this.props.chatInput) {
        this.props.sendMessage(this.props.chatInput);
      }
    }
  };

  render() {
    // if not visible, render chat icon
    if (!this.props.visible) {
      return <ChatIcon toggleChat={this.props.toggleChat} />;
    }

    const messageList = this.props.messages.map((value, key) => {
      return (
        <li className={`message message-${value.type}`} key={key}>
          <div className={`message-${value.type}__content`}>
            <p className="content__text">{value.content}</p>
          </div>
        </li>
      );
    });

    return (
      <div className="chat chat-active">
        <header className="chat-options">
          <button type="button" onClick={this.props.toggleChat}>
            close chat
          </button>
        </header>
        <ul className="chat__messages">{messageList}</ul>

        <div className="chat__input">
          <textarea
            className="input__text"
            value={this.props.chatInput}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            placeholder="Type a message ..."
          />

          <button className="btn input__submit">></button>
        </div>
      </div>
    );
  }
}

export default ChatRoom;
