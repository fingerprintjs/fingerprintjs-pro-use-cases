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
      <div className="ExternalLayout_wrapper">
        <div className="ExternalLayout_main">
          <div className="UsecaseWrapper_wrapper">
            <h1 className="UsecaseWrapper_title">Credential Stuffing problem</h1>
            <p className="UsecaseWrapper_helper">
              This page demonstrates login form protected against{' '}
              <a href="https://fingerprintjs.com/blog/credential-stuffing-prevention-checklist/">Credential Stuffing</a>{' '}
              attack. Martin reused the same password among different sites and his credentials leaked. Luckily for
              Martin, this service uses FingeprintJS Pro and Martin&apos;s account is still protected even though his
              credentials are known. Try to hack into Martin&apos;s account using his credentials <code>user</code> and{' '}
              <code>password</code>. It will be very hard...
            </p>
            <hr className="UsecaseWrapper_divider" />
            <ul className="UsecaseWrapper_notes">
              <li>
                Even with correct credentials, you cannot log in if the system does not recognize your{' '}
                <code>visitorId</code>. The legit account owner can :)
              </li>
              <li>If you provide the wrong credentials 5 times, you&apos;d be locked out!</li>
              <li>
                U h4ck3r? You can try to generate new <code>visitorId</code> and <code>reqeustId</code> and try to log
                in. Good luck :)
              </li>
              <li>
                Need src?{' '}
                <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases" target="_blank" rel="noreferrer">
                  Sure!
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Paper className="ActionWrapper_container full">
        <Stack
          spacing={3}
          direction="row"
          sx={{
            width: '100%',
            minHeight: '100vh',
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
