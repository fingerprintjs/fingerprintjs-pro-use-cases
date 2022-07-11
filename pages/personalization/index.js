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

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [fp, setFp] = useState(null);
  const [products, setProducts] = useState([]);
  const [fpData, setFpData] = useState(null);

  const searchHistoryQuery = useSearchHistory(fpData);

  const [search, setSearch] = useState('');

  const isLoading = loading || !fpData;

  useEffect(() => {
    async function getFingerprint() {
      await getFingerprintJS(setFp);
    }
    !fp && getFingerprint();
  }, [fp]);

  useDebounce(
    async () => {
      if (!fpData) {
        return;
      }

      setLoading(true);

      fetch(`/api/personalization/get-products`, {
        method: 'POST',
        body: JSON.stringify({
          query: search,
          requestId: fpData.requestId,
          visitorId: fpData.visitorId,
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          setProducts(json);

          searchHistoryQuery.refetch();
        })
        .finally(() => {
          setLoading(false);
        });
    },
    250,
    [search, fpData]
  );

  useEffect(() => {
    if (fp) {
      fp.get().then(setFpData);
    }
  }, [fp]);

  return (
    <>
      {!isLoading && <Header />}
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
            minHeight: '100vh',
            paddingX: (theme) => theme.spacing(6),
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
            <CircularProgress />
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
              {products?.data?.length ? (
                products?.data?.map((product) => (
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
