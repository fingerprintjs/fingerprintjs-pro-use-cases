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

export function Sidebar({ search, onSearch }) {
  return (
    <Stack
      spacing={12}
      sx={{
        top: '10px',
        height: '100%',
        minWidth: 300,
        paddingX: (theme) => theme.spacing(3),
      }}
    >
      <SidebarItem title="Search">
        <TextField
          value={search}
          onChange={(event) => {
            onSearch?.(event.target.value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          placeholder="Find perfect coffee..."
          fullWidth
        />
      </SidebarItem>
      <SidebarItem title="Last seen"></SidebarItem>
      <SidebarItem title="You might like"></SidebarItem>
    </Stack>
  );
}
