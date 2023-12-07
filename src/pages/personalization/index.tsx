import { useEffect, useState } from 'react';
import { useDebounce, useSessionStorage } from 'react-use';
import { useSearchHistory } from '../../client/api/personalization/use-search-history';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useProducts } from '../../client/api/personalization/use-products';
import { usePersonalizationNotification } from '../../client/hooks/personalization/use-personalization-notification';
import { useSnackbar } from 'notistack';
import { useUserPreferences } from '../../client/api/personalization/use-user-preferences';
import { useCart } from '../../client/api/personalization/use-cart';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import styles from './personalization.module.scss';
import Image from 'next/image';
import Button from '../../client/components/common/Button/Button';
import CartIcon from '../../client/img/cart.svg';
import { Cart, CartProduct } from '../../client/components/common/Cart/Cart';
import { Search, SearchHistory } from '../../client/components/personalization/searchComponents';
import { ProductCard } from '../../client/components/personalization/productCard';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';

export default function Index({ embed }: CustomPageProps) {
  const { enqueueSnackbar } = useSnackbar();

  const { isLoading: isFpDataLoading, data } = useVisitorData({ extendedResult: true });

  const [didAcknowledge, setDidAcknowledge] = useSessionStorage('didAcknowledgePersonalizationUseCaseWarning', false);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userWelcomed, setUserWelcomed] = useState(false);

  const searchHistoryQuery = useSearchHistory();
  const { addCartItemMutation, removeCartItemMutation, cartQuery } = useCart();
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
      data?.incognito &&
      data?.visitorFound &&
      !userWelcomed &&
      (searchHistoryQuery.data?.data?.length || hasDarkMode || cartQuery.data?.data?.length)
    ) {
      enqueueSnackbar('Welcome back! We applied your dark mode preference and synced your cart and search terms.', {
        variant: 'info',
        className: 'WelcomeBack',
      });

      setUserWelcomed(true);
    }
  }, [cartQuery.data, data, enqueueSnackbar, hasDarkMode, searchHistoryQuery.data, userWelcomed]);

  const cartItems: CartProduct[] | undefined = cartQuery.data?.data.map((item) => {
    return {
      id: item.id,
      name: item.product.name,
      subheadline: 'Big',
      price: item.product.price,
      image: item.product.image,
      count: item.count,
      increaseCount: () => addCartItemMutation.mutateAsync({ productId: item.productId }),
      decreaseCount: () => removeCartItemMutation.mutateAsync({ itemId: item.id }),
    };
  });

  const itemCount = cartItems?.length ?? 0;

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
      <UseCaseWrapper useCase={USE_CASES.personalization} embed={embed} contentSx={{ maxWidth: 'none' }}>
        <div className={styles.twoColumnContainer}>
          <div className={styles.leftColumn}>
            <div className={styles.search}>
              <Search search={search} setSearch={setSearch} />
              <SearchHistory
                searchHistory={searchHistoryQuery.data?.data.map((searchTerm) => searchTerm.query)}
                setSearchHistory={(searchTerm) => setSearch(searchTerm)}
              />
            </div>
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
                    <div>No coffees found :(</div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.cartContainer}>
              <div className={styles.cartContainerTop}>
                <div className={styles.cartIconContainer}>
                  <Image src={CartIcon} alt="Cart" />
                  {itemCount > 0 && <div className={styles.cartCountBadge}>{itemCount}</div>}
                </div>
                <div className={styles.cartStatus}>
                  Your cart {itemCount > 0 ? `has ${itemCount} item${itemCount > 1 ? 's' : ''}` : 'is empty'}
                </div>
              </div>
              {cartItems && cartItems.length > 0 && (
                <div className={styles.cartWrapper}>
                  <Cart items={cartItems} discount={0} taxPerItem={2} />
                </div>
              )}
            </div>
          </div>
        </div>
      </UseCaseWrapper>
    </>
  );
}
