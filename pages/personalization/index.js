import { useEffect, useState } from 'react';
import { ProductItem } from '../../client/components/personalization/product-item';
import { PersonalizationTopSection } from '../../client/components/personalization/personalization-top-section';
import { useDebounce, useSessionStorage } from 'react-use';
import { useSearchHistory } from '../../client/api/use-search-history';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useProducts } from '../../client/api/use-products';
import { useVisitorData } from '../../client/use-visitor-data';
import { usePersonalizationNotification } from '../../client/hooks/personalization/use-personalization-notification';
import { useSnackbar } from 'notistack';
import { useUserPreferences } from '../../client/api/use-user-preferences';
import { useCart } from '../../client/api/use-cart';

export default function Index() {
  const { enqueueSnackbar } = useSnackbar();

  const { isLoading: isFpDataLoading, data } = useVisitorData();

  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [didAcknowledge, setDidAcknowledge] = useSessionStorage('didAcknowledgePersonalizationUseCaseWarning', false);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userWelcomed, setUserWelcomed] = useState(false);

  const searchHistoryQuery = useSearchHistory();
  const { cartQuery } = useCart();
  const productsQuery = useProducts(searchQuery);
  const { hasDarkMode } = useUserPreferences();

  const isLoading = productsQuery.isLoading || isFpDataLoading;

  const { showNotification } = usePersonalizationNotification();

  useEffect(() => {
    if (productsQuery.data?.data?.querySaved) {
      showNotification('Search query saved!');
    }
  }, [productsQuery.data, showNotification]);

  useDebounce(
    () => {
      setSearchQuery(search);
    },
    750,
    [search, setSearchQuery]
  );

  useEffect(() => {
    if (
      data?.incognito &&
      data.visitorFound &&
      !userWelcomed &&
      (searchHistoryQuery.data.data?.length || hasDarkMode || cartQuery.data?.data?.length)
    ) {
      enqueueSnackbar('Welcome back! We applied your dark mode preference and synced your cart and search terms.', {
        variant: 'info',
      });

      setUserWelcomed(true);
    }
  }, [cartQuery.data, data, enqueueSnackbar, hasDarkMode, searchHistoryQuery.data, userWelcomed]);

  return (
    <>
      <Dialog open={!didAcknowledge}>
        <DialogTitle>Heads up!</DialogTitle>
        <DialogContent>
          <DialogContentText whiteSpace="pre-line">
            Fingerprint Pro technology cannot be used to circumvent GDPR and other regulations and must fully comply
            with the laws in the jurisdiction. You should not implement personalization elements across incognito mode
            and normal mode because it violates the users expectations and will lead to a bad experience.
            <br />
            <br />
            This technical demo only uses incognito mode to demonstrate cookie expiration for non-technical folks.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDidAcknowledge(true)}>Okay, I understand</Button>
        </DialogActions>
      </Dialog>
      <UseCaseWrapper
        title="Personalization"
        listItems={[
          <>Try to search for products, we keep a history of your last searches.</>,
          <>We remember your dark mode preference.</>,
          <>Add some items to your very own cart.</>,
          <>
            Try to open this page in incognito mode. Your preferences, search history, and cart content will still be
            there!
          </>,
        ]}
        description="This page demonstrates user personalization that is achieved by Fingerprint Pro. Users don't need to login in to get a tailored experience."
      >
        <PersonalizationTopSection
          search={search}
          onSearch={setSearch}
          searchHistory={searchHistoryQuery.data}
          onSearchHistoryClick={(query) => {
            setSearch(query);
          }}
        />
        {isLoading ? (
          <Box
            sx={(theme) => ({
              marginTop: theme.spacing(6),
            })}
            display="flex"
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
          >
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
            container
            columnSpacing={isSmallerScreen ? 0 : 2}
            sx={(theme) => ({
              padding: 0,
              width: '100%',
              marginTop: theme.spacing(6),
            })}
          >
            {productsQuery.data?.data?.products?.length ? (
              productsQuery.data.data.products.map((product) => (
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
      </UseCaseWrapper>
    </>
  );
}
