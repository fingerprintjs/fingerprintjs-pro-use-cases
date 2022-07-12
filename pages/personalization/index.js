import { useEffect, useState } from 'react';
import { getFingerprintJS } from '../../shared/client';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import { Header } from './header';
import Grid from '@mui/material/Grid';
import { ProductItem } from './product-item';
import { Sidebar } from './sidebar';
import Stack from '@mui/material/Stack';
import { useDebounce } from 'react-use';
import Typography from '@mui/material/Typography';
import { useSearchHistory } from './hooks/useSearchHistory';
import { UseCaseWrapper } from '../../components/use-case-wrapper';
import { Box } from '@mui/material';
import { useProducts } from './hooks/useProducts';

export default function Index() {
  const [fp, setFp] = useState(null);
  const [fpData, setFpData] = useState(null);

  const searchHistoryQuery = useSearchHistory(fpData);

  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const productsQuery = useProducts(fpData, searchQuery);

  const isLoading = productsQuery.isLoading || !fpData;

  useEffect(() => {
    async function getFingerprint() {
      await getFingerprintJS(setFp);
    }
    !fp && getFingerprint();
  }, [fp]);

  useDebounce(
    () => {
      setSearchQuery(search);
    },
    750,
    [search, setSearchQuery]
  );

  useEffect(() => {
    if (fp) {
      fp.get().then(setFpData);
    }
  }, [fp]);

  return (
    <>
      <Header />
      <UseCaseWrapper
        title="Personalization"
        listItems={[<>TODO Detailed description</>]}
        description={<>TODO Description</>}
      />
      <Paper className="ActionWrapper_container full">
        <Stack
          spacing={0}
          direction="row"
          sx={{
            paddingX: (theme) => theme.spacing(6),
            width: 'fill-available',
          }}
        >
          <Sidebar
            search={search}
            onSearch={setSearch}
            searchHistory={searchHistoryQuery.data}
            onSearchHistoryClick={(query) => {
              setSearch(query);
            }}
          />
          {isLoading ? (
            <Box display="flex" width="70%" height="100%" justifyContent="center" alignItems="center">
              <CircularProgress
                sx={{
                  marginLeft: (theme) => theme.spacing(3),
                }}
              />
            </Box>
          ) : (
            <Grid
              justifyContent="center"
              alignItems="center"
              width="70%"
              container
              columnSpacing={4}
              sx={{
                paddingX: (theme) => theme.spacing(3),
                // TODO Remove !important
                margin: '0 auto !important',
                padding: 0,
              }}
            >
              {productsQuery.data?.data?.length ? (
                productsQuery.data?.data?.map((product) => (
                  <Grid
                    item
                    xs={12}
                    md={4}
                    key={product.id}
                    sx={{
                      marginBottom: (theme) => theme.spacing(4),
                    }}
                  >
                    <ProductItem product={product} />
                  </Grid>
                ))
              ) : (
                <Typography variant="h5">No coffees found :(</Typography>
              )}
            </Grid>
          )}
        </Stack>
      </Paper>
    </>
  );
}
