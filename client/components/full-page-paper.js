import Paper from '@mui/material/Paper';

export function FullPagePaper({ children, ...props }) {
  return (
    <Paper
      sx={{
        width: '100%',
        height: 'calc(100vh - 104px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}
