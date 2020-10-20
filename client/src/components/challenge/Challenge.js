import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import ChatRoom from './ChatRoom';
import './styles/challenge.css';

const Challenge = (props) => {
  const [inviteVisible, setInviteVisibility] = useState(false);
  const {
    title,
    prompt,
    testing,
    testPassed,
    privateRoom,
    code,
    inviteLink,
    chatInput,
    messages,
    setMessage,
    chatVisible,
    toggleChatVisibility,
    convertRoomToPublic,
    sendMessage,
    setCode,
    testCode,
  } = props;

  return (
    <section className="challenge">
      <header className="challenge__header">
        <h3 className="challenge__heading">{title}</h3>

        <div className="challenge__details">
          <p className="challenge__prompt">{prompt}</p>
        </div>
      </header>

      {testPassed && (
        <div className="box box--center">
          <p className="challenge__complete">
            Challenge Completed!!!
            <Link to="/challenges">Click here</Link> to go dashboard.
          </p>
        </div>
      )}

      <div className="challenge__content">
        <CodeMirror
          className="challenge__editor"
          value={code}
          options={{
            lineNumbers: true,
            lineWrapping: true,
            theme: 'material',
            tabSize: 2,
            mode: 'javascript',
          }}
          onBeforeChange={(editor, data, value) => {
            setCode(value);
          }}
          onChange={(editor, data, value) => {}}
        />

        {!privateRoom ? (
          <ChatRoom
            chatInput={chatInput}
            messages={messages}
            setMessage={setMessage}
            sendMessage={sendMessage}
            visible={chatVisible}
            toggleChat={toggleChatVisibility}
          />
        ) : null}
      </div>

      <div className="challenge__options">
        <button
          className="btn btn--test"
          type="button"
          disabled={testPassed || testing}
          onClick={() => testCode(code)}
        >
          Run Tests
        </button>

        <div className="">
          <div className="">
            {privateRoom ? (
              <button
                clasName="btn"
                type="button"
                onClick={convertRoomToPublic}
              >
                Create Link
              </button>
            ) : (
              <>
                <button
                  className="btn"
                  onClick={() => setInviteVisibility(!inviteVisible)}
                  type="button"
                >
                  Show Invite
                </button>

                <div
                  className={`box box--center box--overlay ${
                    inviteVisible ? '' : 'box--hidden'
                  }`}
                >
                  <div className="challenge__invite">
                    <button
                      className="btn btn--close btn--right"
                      type="button"
                      onClick={() => setInviteVisibility(!inviteVisible)}
                    >
                      X
                    </button>

                    <div>
                      <p>Invite Link</p>
                      <span className="challenge__invite-link">
                        {inviteLink}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Challenge;
