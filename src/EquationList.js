import React from 'react';
import Equation from './Equation';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// import { Box } from '@mui/system';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function plus() {
  const operation = {};
  operation.name = 'Addition';
  operation.equations = [];

  while (operation.equations.length < 10) {
    const a = {};
    a.x = getRandomInt(1, 20);
    a.y = getRandomInt(1, 20 - a.x);
    a.operation = '+';
    a.solution = a.x + a.y;
    a.id = operation.equations.length + 1;
    operation.equations.push(a);
  }
  return operation;
}

function minus() {
  const operation = {};
  operation.name = 'Subtraction';
  operation.equations = [];

  while (operation.equations.length < 10) {
    const a = {};
    a.x = getRandomInt(2, 20); // Start from 2 to avoid zero result
    a.y = getRandomInt(1, a.x); // Ensure second operand is less than or equal to first
    a.operation = '-';
    a.solution = a.x - a.y;
    a.id = operation.equations.length + 1;
    operation.equations.push(a);
  }
  return operation;
}

const EquationList = (props) => {
  const operation = minus();
  const rows = (equations) => {
    const list = [];
    for (let eq of equations)
      list.push(<Equation eq={eq} key={eq.id.toString()} />);
    return list;
  };

  return (
    <Container
      maxWidth="xs"
      fixed
      sx={{
        width: 300,
      }}
    >
      <Typography variant="h5">{operation.name}</Typography>
      {rows(operation.equations)}
    </Container>
  );
};

export default EquationList;
