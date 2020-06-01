import React from 'react';
import { Link } from 'react-router-dom';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import ChatRoom from './ChatRoom';
import TestButton from '../shared/LoadButton';

import '../../styles/challenge.css';

const Challenge = (props) => {
  const linkChallenge = props.private ? (
    <button onClick={props.convertRoomToPublic}>Create Link</button>
  ) : (
    <p>{props.inviteLink}</p>
  );

  return (
    <section className="challenge">
      <header className="challenge-header">
        <h3 className="challenge-header__title">{props.title}</h3>
        <div className="challenge-header__details">
          <p className="challenge-header__prompt">{props.prompt}</p>
        </div>
      </header>

      {props.testPassed && (
        <div className="">
          <p>
            Challenge Completed!!!
            <Link to="/dashboard">Click here</Link> to go dashboard.
          </p>
        </div>
      )}

      <CodeMirror
        className="challenge-editor"
        value={props.code}
        options={{
          lineNumbers: true,
          theme: 'material',
          tabSize: 2,
          mode: 'javascript',
        }}
        onBeforeChange={(editor, data, value) => {
          props.setCode(value);
        }}
        onChange={(editor, data, value) => {}}
      />

      {!props.private && (
        <ChatRoom
          chatInput={props.chatInput}
          messages={props.messages}
          setMessage={props.setMessage}
          sendMessage={props.sendMessage}
          visible={props.chatVisible}
          toggleChat={props.toggleChatVisibility}
        />
      )}

      <div className="challenge-options">
        <TestButton
          disabled={props.testPassed}
          text="Test Code"
          loading={props.testing}
          onClick={() => props.testCode(props.code)}
        />

        <label>{linkChallenge}</label>
      </div>
    </section>
  );
};

export default Challenge;
