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
  let i = 1;
  while (i < 11) {
    const a = {};
    a.x = getRandomInt(1, 20);
    a.y = getRandomInt(1, 20);
    a.operation = '+';
    a.solution = a.x + a.y;
    a.id = i;
    if (a.x + a.y < 21) {
      i++;
      operation.equations.push(a);
    }
  }
  return operation;
}

const EquationList = (props) => {
  const operation = plus();
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
