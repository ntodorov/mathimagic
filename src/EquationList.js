import React from 'react';
import Equation from './Equation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
  const [operation, setOperation] = React.useState(() => minus());
  const [answers, setAnswers] = React.useState({});

  const handleAnswerChange = React.useCallback((id, payload) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: payload,
    }));
  }, []);

  const handleReset = React.useCallback(() => {
    setOperation(minus());
    setAnswers({});
  }, []);

  const rows = (equations) => {
    const list = [];
    for (let eq of equations)
      list.push(
        <Equation
          eq={eq}
          key={eq.id.toString()}
          onAnswerChange={handleAnswerChange}
        />
      );
    return list;
  };

  const totalQuestions = operation.equations.length;
  const answerEntries = Object.values(answers);
  const correctCount = answerEntries.filter((entry) => entry.isCorrect).length;
  const progressValue =
    totalQuestions === 0 ? 0 : (correctCount / totalQuestions) * 100;

  return (
    <Paper className="practiceCard" variant="outlined">
      <Stack spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Practice
          </Typography>
          <Typography variant="h6">{operation.name}</Typography>
        </Box>
        <Stack spacing={1.5}>{rows(operation.equations)}</Stack>
        <Divider />
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Streak
              </Typography>
              <Typography variant="h6">{correctCount}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Daily goal
              </Typography>
              <Typography variant="h6">
                {correctCount}/{totalQuestions}
              </Typography>
            </Box>
          </Stack>
          <LinearProgress
            aria-label="Session progress"
            variant="determinate"
            value={progressValue}
          />
          <Button variant="text" size="small" onClick={handleReset}>
            Start a new set
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default EquationList;
