import React, { useState } from 'react';
import classnames from 'classnames';

import './Equation.css';

const Equation = (props) => {
  const { eq } = props;
  const [answer, setAnswer] = useState('');
  const [correct, setCorrect] = useState('');

  const handleChange = (e) => {
    setAnswer(e.target.value);
    let label = '';
    if (e.target.value) {
      label = parseInt(e.target.value) === eq.solution ? 'Yes' : 'No';
    }

    setCorrect(label);
  };

  return (
    <div>
      <h1>
        {eq.x} + {eq.y} ={' '}
        <input
          type="number"
          className="answer"
          value={answer}
          onChange={handleChange}
        ></input>{' '}
        <span className={correct === 'No' ? 'error' : 'correct'}>
          {correct}
        </span>
      </h1>
    </div>
  );
};

export default Equation;
