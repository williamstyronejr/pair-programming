import React, { useState, useEffect } from 'react';
import './styles/timer.css';

/**
 * Converts a number into a string and adds a zero in front.
 * @param {Number} number A number to convert to string
 * @return {String} Returns a string of the number with a zero in front.
 */
function addLeadingZero(number) {
  return (new Array(3).join('0') + number).slice(-2);
}

// Not completely accraute
export const Timer = ({ isPaused }) => {
  const [timer, setTimer] = useState(0);
  let timerInterval;

  useEffect(() => {
    timerInterval = setInterval(() => {
      if (!isPaused) setTimer((time) => time + 1);
    }, 1000);

    // Clean up
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  return (
    <div className="timer">
      <span className="timer__hour">
        {addLeadingZero(Math.floor(timer / 60))}
      </span>
      :<span className="timer__minute">{addLeadingZero(timer % 60)}</span>
    </div>
  );
};
