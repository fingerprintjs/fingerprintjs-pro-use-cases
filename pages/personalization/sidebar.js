import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { Search } from '@mui/icons-material';

function SidebarItem({ children, title }) {
  return (
    <Paper
      sx={{
        padding: (theme) => theme.spacing(2),
      }}
    >
      <Typography
        color="text.secondary"
        variant="h6"
        sx={{
          marginBottom: (theme) => theme.spacing(2),
        }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export function Sidebar() {
  return (
    <Stack
      spacing={12}
      sx={{
        position: 'sticky',
        top: '10px',
        height: '100%',
        minWidth: 300,
        paddingTop: (theme) => theme.spacing(3),
      }}
    >
      <SidebarItem title="Search">
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          placeholder="Find perfect dog..."
          fullWidth
        />
      </SidebarItem>
      <SidebarItem title="Last seen"></SidebarItem>
      <SidebarItem title="You might like"></SidebarItem>
    </Stack>
  );
}
