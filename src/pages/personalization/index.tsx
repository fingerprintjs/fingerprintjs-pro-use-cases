import { FunctionComponent, useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { useSearchHistory } from '../../client/api/personalization/use-search-history';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { CircularProgress } from '@mui/material';
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
import SearchIcon from './img/search.svg';
import CartIcon from './img/cart.svg';
import { UserCartItem } from '../../server/personalization/database';
import { ButtonPlusSvg } from '../../client/img/buttonPlusSvg';
import { ButtonMinusSvg } from '../../client/img/buttonMinusSvg';
import { Cart, CartProduct } from '../../client/components/common/Cart/Cart';

type SearchProps = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};
const Search: FunctionComponent<SearchProps> = ({ search, setSearch }) => {
  return (
    <div>
      <div className={styles.searchBox}>
        <Image src={SearchIcon} alt="Search" className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search for your favorite coffee"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </div>
    </div>
  );
};

const SEARCH_HISTORY_DISPLAY_LIMIT = 6;

type SearchHistoryProps = {
  searchHistory: string[];
  setSearchHistory: (searchTerm: string) => void;
};

const SearchHistory: FunctionComponent<SearchHistoryProps> = ({ searchHistory, setSearchHistory }) => {
  if (searchHistory.length === 0) {
    return null;
  }

  return (
    <div>
      <div className={styles.searchHistory}>
        Last searches:{' '}
        {searchHistory.slice(0, SEARCH_HISTORY_DISPLAY_LIMIT).map((searchTerm, index) => (
          <>
            <span key={index} onClick={() => setSearchHistory(searchTerm)} className={styles.searchTerm}>
              {searchTerm}
            </span>
            ,{' '}
          </>
        ))}
      </div>
    </div>
  );
};

type Product = {
  price: number;
  name: string;
  image: string;
  id: number;
};

const ItemCounter: FunctionComponent<{
  count: number;
  addItem: () => void;
  removeItem: () => void;
}> = ({ count, addItem, removeItem }) => {
  return (
    <div className={styles.productCardItemCounter}>
      <div onClick={removeItem}>
        <ButtonMinusSvg />
      </div>
      <span>{count}</span>
      <div onClick={addItem}>
        <ButtonPlusSvg />
      </div>
    </div>
  );
};

const ProductCard: FunctionComponent<{ product: Product }> = ({ product }) => {
  const { addCartItemMutation, removeCartItemMutation, cartQuery } = useCart();
  const { showNotification } = usePersonalizationNotification();
  const [wasAdded, setWasAdded] = useState(false);

  const cartItem: UserCartItem | undefined = cartQuery.data?.data.find((item) => item.productId === product.id);

  const addToCart = async () => {
    await addCartItemMutation.mutateAsync({ productId: product.id });
    if (!cartItem) {
      showNotification('Product added to cart!');
    }
    setWasAdded(true);
  };

  const removeFromCart = async () => {
    await removeCartItemMutation.mutateAsync({ itemId: cartItem?.id });
  };

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
        width={250}
        height={172}
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
            {cartItem ? (
              <ItemCounter count={cartItem.count} addItem={addToCart} removeItem={removeFromCart} />
            ) : (
              <Button size="small" onClick={addToCart}>
                {addCartItemMutation.isLoading ? 'Adding...' : 'Add to cart'}
              </Button>
            )}

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

  // const [didAcknowledge, setDidAcknowledge] = useSessionStorage('didAcknowledgePersonalizationUseCaseWarning', false);
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

  const cartItems: CartProduct[] = cartQuery.data?.data.map((item) => {
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
        <div className={styles.twoColumnContainer}>
          <div className={styles.leftColumn}>
            <div className={styles.search}>
              <Search search={search} setSearch={setSearch} />
              <SearchHistory
                searchHistory={searchHistoryQuery.data.data.map((searchTerm) => searchTerm.query)}
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
              {cartItems?.length > 0 && (
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
