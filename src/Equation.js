import React, { useState } from 'react';

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
      {eq.x} + {eq.y} ={' '}
      <input
        type="number"
        className="answer"
        value={answer}
        onChange={handleChange}
      ></input>{' '}
      {correct}
    </div>
  );
};

export default Equation;
