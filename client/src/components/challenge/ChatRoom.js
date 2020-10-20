import React, { useState } from 'react';
import './styles/chatRoom.css';

const ChatRoom = ({
  setMessage,
  sendMessage,
  visible,
  toggleChat,
  chatInput,
  messages,
}) => {
  const [location, setLocation] = useState('aside');
  const [settingsVisible, setSettingsVisible] = useState(false);

  if (visible) {
    return (
      <div className="chat chat--hidden">
        <svg
          className="chat__icon"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          onClick={toggleChat}
        >
          <path
            fillRule="evenodd"
            d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"
          />
        </svg>
      </div>
    );
  }

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  // When user hits enter (without shift), send current message
  const onKeyDown = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault(); // Stop '\n' from being put in form

      // Prevent sending empty message (spaces work)
      if (chatInput) sendMessage(chatInput);
    }
  };

  const messageList = messages.map((msg, key) => {
    return (
      <li className={`message message-${msg.type}`} key={key}>
        <div className={`message-${msg.type}__content`}>
          <p className="content__text">{msg.content}</p>
        </div>
      </li>
    );
  });

  return (
    <div className={`chat chat--${location}`}>
      <header className="chat__header">
        <h4 className="chat__heading">
          <button className="btn btn--chat" onClick={toggleChat}>
            Chat
          </button>
        </h4>

        <div className="chat__options">
          <button
            type="button"
            className="btn btn--options"
            onClick={() => setSettingsVisible(!settingsVisible)}
          >
            ...
          </button>

          <div
            className={`chat__settings ${
              settingsVisible ? 'chat__settings--active' : ''
            }`}
          >
            <div className="chat__layouts">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setLocation('aside');
                }}
              >
                aside
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setLocation('detach');
                }}
              >
                detach
              </button>
            </div>
            <hr className="divider" />
          </div>
        </div>
      </header>

      <ul className="chat__messages">{messageList}</ul>

      <div className="chat__input">
        <textarea
          className="input__text"
          value={chatInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Type a message ..."
        />
      </div>
    </div>
  );
};

export default ChatRoom;
