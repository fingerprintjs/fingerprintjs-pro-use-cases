import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { ProductItem } from '../../components/personalization/product-item';
import { PersonalizationTopSection } from '../../components/personalization/personalization-top-section';
import { useDebounce } from 'react-use';
import Typography from '@mui/material/Typography';
import { useSearchHistory } from '../../shared/client/api/use-search-history';
import { UseCaseWrapper } from '../../components/use-case-wrapper';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useProducts } from '../../shared/client/api/use-products';
import { useVisitorData } from '../../shared/client/use-visitor-data';
import { usePersonalizationNotification } from '../../hooks/use-personalization-notification';
import { useSnackbar } from 'notistack';
import { useUserPreferences } from '../../shared/client/api/use-user-preferences';
import { useCart } from '../../shared/client/api/use-cart';

export default function Index() {
  const { enqueueSnackbar } = useSnackbar();

  const { isLoading: isFpDataLoading, data } = useVisitorData();

  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('md'));

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
  );
}
