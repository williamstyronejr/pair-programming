import React from 'react';

const ChatIcon = props => (
  <div className="chat-icon">
    <button type="button" onClick={props.toggleChat}>
      chat button
    </button>
  </div>
);

export default ChatIcon;
