import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { Chip } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export default function Equation(props) {
  const { eq } = props;
  const [answer, setAnswer] = React.useState('');
  const [error, setError] = React.useState(false);

  const handleChange = (e) => {
    setAnswer(e.target.value);
    setError(parseInt(e.target.value) != eq.solution);
  };

  return (
    <Box sx={{ minWidth: 190, maxWidth: 200 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex' }}>
            <Chip label={eq.id} size="small" />
          </Box>
          <Typography variant="h5" component="div">
            {eq.x} + {eq.y} ={' '}
            <TextField
              sx={{
                width: 25,
              }}
              error={error}
              variant="standard"
              onChange={handleChange}
            >
              {answer}
            </TextField>
            {!answer ? (
              ''
            ) : error ? (
              <SentimentDissatisfiedIcon color="success" />
            ) : (
              <SentimentSatisfiedAltIcon color="error" />
            )}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
