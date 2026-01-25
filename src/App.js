import './App.css';
import EquationList from './EquationList';
import ButtonAppBar from './ButtonAppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function App() {
  return (
    <div className="App">
      <ButtonAppBar />
      <Container maxWidth="sm" className="appMain">
        <Stack spacing={3}>
          <Paper className="heroCard" elevation={0}>
            <Stack spacing={2}>
              <Typography variant="h4" component="h1">
                Math practice that feels like play
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Short, joyful sessions that build confidence one answer at a
                time.
              </Typography>
              <Box className="heroChips">
                <Chip label="Ages 6-10" color="primary" size="small" />
                <Chip label="5-minute sessions" size="small" />
                <Chip label="Phone-first design" size="small" />
              </Box>
              <Button variant="contained" size="large">
                Start Practice
              </Button>
            </Stack>
          </Paper>
          <Paper className="progressCard" variant="outlined">
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Today's goal
                </Typography>
                <Typography variant="h6">Complete 10 questions</Typography>
              </Box>
              <LinearProgress
                aria-label="Practice progress"
                variant="determinate"
                value={0}
              />
              <Typography variant="caption" color="text.secondary">
                0 of 10 completed
              </Typography>
            </Stack>
          </Paper>
          <EquationList />
        </Stack>
      </Container>
    </div>
  );
}

export default App;
