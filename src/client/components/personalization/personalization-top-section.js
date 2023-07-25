import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { Clear, Search } from '@mui/icons-material';
import { useMemo, useRef, useState } from 'react';
import Popover from '@mui/material/Popover';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import { Cart } from './cart';

const SEARCH_HISTORY_DISPLAY_LIMIT = 3;

function PersonalizationTopSectionItem({ children, title }) {
  return (
    <Paper
      variant="outlined"
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

function SearchHistory({ searchHistory, onSearchHistoryClick }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverAnchorEl = useRef();

  const displaySearchHistory = useMemo(() => {
    if (searchHistory.data.length <= SEARCH_HISTORY_DISPLAY_LIMIT) {
      return searchHistory.data;
    }

    return searchHistory.data.slice(0, SEARCH_HISTORY_DISPLAY_LIMIT);
  }, [searchHistory.data]);

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Typography variant="caption">Last searches:</Typography>
      {displaySearchHistory.map((searchHistory, index, arr) => (
        <Typography
          className="SearchHistory_Item"
          maxWidth="80px"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          onClick={(event) => {
            event.preventDefault();

            onSearchHistoryClick(searchHistory.query);
          }}
          href="#"
          as="a"
          variant="caption"
          key={searchHistory.id}
        >
          {searchHistory.query}
          {index !== arr.length - 1 && ', '}
        </Typography>
      ))}
      {searchHistory.data.length > SEARCH_HISTORY_DISPLAY_LIMIT && (
        <>
          <Chip
            clickable
            onClick={() => setPopoverOpen(true)}
            ref={popoverAnchorEl}
            size="small"
            label={<>+{searchHistory.data.length - SEARCH_HISTORY_DISPLAY_LIMIT}</>}
          />
          <Popover
            anchorOrigin={{
              horizontal: 'center',
              vertical: 'bottom',
            }}
            onClose={() => setPopoverOpen(false)}
            open={popoverOpen}
            anchorEl={popoverAnchorEl.current}
          >
            <Paper>
              <List subheader={<ListSubheader>Last searches:</ListSubheader>}>
                {searchHistory.data.slice(SEARCH_HISTORY_DISPLAY_LIMIT).map((searchHistory) => (
                  <ListItemButton
                    className="SearchHistory_Item"
                    onClick={() => {
                      onSearchHistoryClick(searchHistory.query);

                      setPopoverOpen(false);
                    }}
                    key={searchHistory.id}
                  >
                    {searchHistory.query}
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Popover>
        </>
      )}
    </Stack>
  );
}

export function PersonalizationTopSection({ search, onSearch, searchHistory, onSearchHistoryClick }) {
  return (
    <Stack
      spacing={6}
      sx={{
        top: '10px',
        height: '100%',
        width: '100%',
      }}
    >
      <PersonalizationTopSectionItem title="Cart">
        <Cart />
      </PersonalizationTopSectionItem>
      <PersonalizationTopSectionItem title="Search">
        <Stack direction="column" spacing={2}>
          <TextField
            name="search"
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
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => onSearch('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="Find perfect coffee..."
            fullWidth
          />
          {Boolean(searchHistory?.size) && (
            <SearchHistory onSearchHistoryClick={onSearchHistoryClick} searchHistory={searchHistory} />
          )}
        </Stack>
      </PersonalizationTopSectionItem>
    </Stack>
  );
}
