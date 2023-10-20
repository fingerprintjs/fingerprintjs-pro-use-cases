import { FunctionComponent, useEffect, useState } from 'react';
import { ProductItem } from '../../client/components/personalization/product-item';
import { PersonalizationTopSection } from '../../client/components/personalization/personalization-top-section';
import { useDebounce, useSessionStorage } from 'react-use';
import { useSearchHistory } from '../../client/api/personalization/use-search-history';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import {
  Box,
  // Button,
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
import styles from './personalization.module.scss';
import Image from 'next/image';
import Button from '../../client/components/common/Button/Button';
import HeartIcon from './img/heart.svg';

type Product = {
  price: number;
  name: string;
  image: string;
  id: string;
};

const ProductCard: FunctionComponent<{ product: Product }> = ({ product }) => {
  const { addCartItemMutation } = useCart();
  const { showNotification } = usePersonalizationNotification();
  const [wasAdded, setWasAdded] = useState(false);

  useDebounce(
    () => {
      if (wasAdded) {
        setWasAdded(false);
      }
    },
    1000,
    [wasAdded],
  );
  return (
    <div className={styles.productCard}>
      <Image
        src={product.image}
        alt={product.name}
        sizes="100vw"
        width="250"
        height="172"
        className={styles.productCardImage}
      />
      <div className={styles.productCardBody}>
        <div>
          <div className={styles.productCardName}>{product.name}</div>
          <div className={styles.productCardSize}>Big</div>
        </div>
        <div className={styles.productCardBodyBottomRow}>
          <div className={styles.productCardPrice}>${product.price.toFixed(2)}</div>
          <div className={styles.productCardButtons}>
            <Button size="small">Add to Cart</Button>
            <Button size="small" outlined disabled className={styles.addToFavorites}>
              <Image src={HeartIcon} alt="Add to favorites" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      {/* <Dialog open={!didAcknowledge}>
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
      </Dialog> */}
      <UseCaseWrapper useCase={USE_CASES.personalization} embed={embed} contentSx={{ maxWidth: 'none' }}>
        {/* <PersonalizationTopSection
          search={search}
          onSearch={setSearch}
          searchHistory={searchHistoryQuery.data}
          onSearchHistoryClick={(query) => {
            setSearch(query);
          }}
        /> */}

        <div className={styles.twoColumnContainer}>
          <div className={styles.leftColumn}>
            <div className={styles.search}></div>
            <div className={styles.products}>
              {isLoading ? (
                <CircularProgress
                  sx={{
                    marginLeft: (theme) => theme.spacing(3),
                  }}
                />
              ) : (
                <>
                  {productsQuery.data?.data?.products?.length ? (
                    productsQuery.data.data.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <Typography variant="h5">No coffees found :(</Typography>
                  )}
                </>
              )}
            </div>
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.cart}></div>
          </div>
        </div>
      </UseCaseWrapper>
    </>
  );
}
