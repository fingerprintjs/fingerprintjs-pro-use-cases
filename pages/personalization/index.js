import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { ProductItem } from './product-item';
import { Sidebar } from './sidebar';
import Stack from '@mui/material/Stack';
import { useDebounce } from 'react-use';
import Typography from '@mui/material/Typography';
import { useSearchHistory } from './hooks/use-search-history';
import { UseCaseWrapper } from '../../components/use-case-wrapper';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useProducts } from './hooks/use-products';
import { useVisitorData } from '../../shared/client/use-visitor-data';

export default function Index() {
  const { isLoading: isFpDataLoading } = useVisitorData();

  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('md'));

  const searchHistoryQuery = useSearchHistory();

  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const productsQuery = useProducts(searchQuery);

  const isLoading = productsQuery.isLoading || isFpDataLoading;

  useDebounce(
    () => {
      setSearchQuery(search);
    },
    750,
    [search, setSearchQuery]
  );

  return (
    <UseCaseWrapper
      variant="full"
      title="Personalization"
      listItems={[
        <>Try to search for some products, we keep history of your last searches.</>,
        <>We remember your dark mode preference.</>,
        <>Try to open this page in incognito mode. Your preferences will still be there!</>,
      ]}
      description="This page demonstrates user personalization that it achieved by using fingerprinting. Users are not required to login in order to get experience that is tailored to them."
    >
      <Stack
        spacing={0}
        direction={isSmallerScreen ? 'column' : 'row'}
        sx={(theme) => ({
          width: 'fill-available',

          [theme.breakpoints.up('md')]: {
            paddingX: (theme) => theme.spacing(6),
          },
        })}
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
          <Box
            sx={(theme) => ({
              [theme.breakpoints.down('md')]: {
                marginTop: theme.spacing(6),
              },
            })}
            display="flex"
            width={isSmallerScreen ? '100%' : '70%'}
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
            columnSpacing={isSmallerScreen ? 0 : 4}
            sx={(theme) => ({
              margin: '0 auto',
              padding: 0,
              width: '70%',

              [theme.breakpoints.down('md')]: {
                width: '100%',
                marginTop: theme.spacing(6),
              },

              [theme.breakpoints.up('md')]: {
                paddingX: theme.spacing(3),
              },
            })}
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
    </UseCaseWrapper>
  );
}
