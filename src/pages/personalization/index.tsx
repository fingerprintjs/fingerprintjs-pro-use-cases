import { useEffect, useState } from 'react';
import { ProductItem } from '../../client/components/personalization/product-item';
import { PersonalizationTopSection } from '../../client/components/personalization/personalization-top-section';
import { useDebounce, useSessionStorage } from 'react-use';
import { useSearchHistory } from '../../client/api/personalization/use-search-history';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useProducts } from '../../client/api/personalization/use-products';
import { useVisitorData } from '../../client/use-visitor-data';
import { usePersonalizationNotification } from '../../client/hooks/personalization/use-personalization-notification';
import { useSnackbar } from 'notistack';
import { useUserPreferences } from '../../client/api/personalization/use-user-preferences';
import { useCart } from '../../client/api/personalization/use-cart';
import React from 'react';
import { ExtendedGetResult } from '@fingerprintjs/fingerprintjs-pro';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';

export default function Index({ embed }: CustomPageProps) {
  const { enqueueSnackbar } = useSnackbar();

  const { isLoading: isFpDataLoading, data } = useVisitorData({ extendedResult: true });

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
    [search, setSearchQuery],
  );

  useEffect(() => {
    if (
      (data as ExtendedGetResult)?.incognito &&
      data.visitorFound &&
      !userWelcomed &&
      (searchHistoryQuery.data.data?.length || hasDarkMode || cartQuery.data?.data?.length)
    ) {
      enqueueSnackbar('Welcome back! We applied your dark mode preference and synced your cart and search terms.', {
        variant: 'info',
        className: 'WelcomeBack',
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
      <UseCaseWrapper useCase={USE_CASES.personalization} embed={embed}>
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
          <Box
            sx={(theme) => ({
              display: 'grid',
              gridTemplateColumns: isSmallerScreen ? '1fr' : 'repeat(3, 1fr)',
              gridGap: theme.spacing(2),
              padding: 0,
              width: '100%',
              marginTop: theme.spacing(6),
            })}
          >
            {productsQuery.data?.data?.products?.length ? (
              productsQuery.data.data.products.map((product) => <ProductItem key={product.id} product={product} />)
            ) : (
              <Typography variant="h5">No coffees found :(</Typography>
            )}
          </Box>
        )}
      </UseCaseWrapper>
    </>
  );
}
