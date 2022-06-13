import React from 'react';
import Equation from './Equation';



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function plus() {
  let equations = [];
  let i = 1;
  while (i < 51) {
    const a = {};
    a.x = getRandomInt(1, 20);
    a.y = getRandomInt(1, 20);
    a.operation = "+";
    a.solution = a.x + a.y;
    a.id = i;
    if (a.x + a.y < 1001) {
      i++;
      equations.push(a);
    }
  }
  return equations;
}

const EquationList = (props) => {

  const rows = () => {
    const equations = plus();
    const list = [];
    for (let eq of equations) 
      list.push(<Equation eq={eq} key={eq.id.toString()} />);
    return list;
  }    

  return (
     rows()
  )
}

export default EquationList