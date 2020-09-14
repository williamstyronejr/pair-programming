import React, { useState, useEffect } from 'react';

function addLeadingZero(number) {
  return (new Array(3).join('0') + number).slice(-2);
}

// Not completely accraute
export const Timer = ({ isPaused }) => {
  console.log(isPaused);
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
    <div className="">
      <span className="">{addLeadingZero(Math.floor(timer / 60))}</span>:
      <span className="">{addLeadingZero(timer % 60)}</span>
    </div>
  );
};
