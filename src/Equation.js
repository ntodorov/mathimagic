import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { Chip } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const emoji = (error) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    {error ? (
      <SentimentDissatisfiedIcon color="error" />
    ) : (
      <SentimentSatisfiedAltIcon color="success" />
    )}
  </Box>
);

function Equation(props) {
  const { eq, onAnswerChange, inputRef } = props;
  const [answer, setAnswer] = React.useState('');
  const [error, setError] = React.useState(false);

  const handleChange = (e) => {
    const nextValue = e.target.value;
    const trimmedValue = nextValue.trim();
    const hasAnswer = trimmedValue !== '';
    const isCorrect = hasAnswer && Number(trimmedValue) === eq.solution;

    setAnswer(nextValue);

    if (!hasAnswer) {
      setError(false);
      onAnswerChange?.(eq.id, {
        value: nextValue,
        hasAnswer,
        isCorrect,
      });
      return;
    }

    setError(!isCorrect);
    onAnswerChange?.(eq.id, {
      value: nextValue,
      hasAnswer,
      isCorrect,
    });
  };

  const hasAnswer = answer.trim() !== '';
  const feedbackText = hasAnswer ? (error ? 'Try again' : 'Nice job!') : '';

  return (
    <Box sx={{ width: '100%' }}>
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, borderColor: 'rgba(31, 39, 51, 0.12)' }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Chip label={eq.id} size="small" />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              mt: 1.5,
            }}
          >
            <Typography variant="h5" component="span">
              {eq.x} {eq.operation} {eq.y} =
            </Typography>
            <TextField
              value={answer}
              error={hasAnswer && error}
              variant="outlined"
              size="small"
              type="tel"
              onChange={handleChange}
              inputRef={inputRef}
              autoComplete="off"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                'aria-label': `Answer for question ${eq.id}`,
              }}
              sx={{
                width: 72,
                '& input': {
                  textAlign: 'center',
                  fontSize: '1.25rem',
                  padding: '8px 10px',
                },
              }}
            />
            {!hasAnswer ? '' : emoji(error)}
          </Box>
          <Typography
            variant="caption"
            color={error ? 'error.main' : 'success.main'}
            sx={{ display: 'block', mt: 1 }}
            aria-live="polite"
          >
            {feedbackText}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default React.memo(Equation);
