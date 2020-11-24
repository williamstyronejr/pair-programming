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
  const [details, setDetails] = useState('prompt');
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
    testResults,
  } = props;

  let detailsComponent;

  switch (details) {
    case 'output': {
      let testPass = 0;
      let testFail = 0;

      const listItems = testResults.map((test) => {
        if (test.status) {
          testPass += 1;
        } else {
          testFail += 1;
        }

        return (
          <li
            key={test.name}
            className={`challenge__item ${
              test.status ? 'challenge__item--pass' : 'challenge__item--fail'
            }`}
          >
            {test.message}
          </li>
        );
      });

      detailsComponent = (
        <div className="challenge__output">
          <header className="challenge__results">
            <h5 className="challenge__status">{`${
              testResults.length > 0
                ? `Test Passed: ${testPass} Test Failed: ${testFail}`
                : testing
                ? 'Status: Requesting test from server'
                : 'Your test results will show here'
            }`}</h5>
          </header>
          <ul className="challenge__list">{listItems}</ul>
        </div>
      );
      break;
    }
    default:
      detailsComponent = (
        <div className="challenge__info">
          <p className="challenge__prompt">
            {prompt + prompt + prompt + prompt + prompt + prompt}
          </p>
        </div>
      );
  }

  return (
    <section className="challenge">
      <header className="challenge__header">
        <h3 className="challenge__heading">{title}</h3>
      </header>

      <div className="challenge__content">
        <div className="challenge__details">
          <nav className="challenge__nav">
            <button
              className={`btn btn--nav ${
                details === 'prompt' ? 'btn--nav-active' : ''
              }`}
              type="button"
              onClick={() => setDetails('prompt')}
            >
              Prompt
            </button>

            <button
              className={`btn btn--nav ${
                details === 'output' ? 'btn--nav-active' : ''
              }`}
              type="button"
              onClick={() => setDetails('output')}
            >
              Output
            </button>
          </nav>

          {detailsComponent}

          {testPassed && (
            <div className="box box--center">
              <p className="challenge__complete">
                Challenge Completed!!!
                <Link to="/challenges">Click here</Link> to go dashboard.
              </p>
            </div>
          )}
        </div>

        <div className="challenge__tools">
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
                className="btn"
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
