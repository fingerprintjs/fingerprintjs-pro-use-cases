import { useCart } from '../../api/personalization/use-cart';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Image from 'next/legacy/image';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Add, Remove } from '@mui/icons-material';
import { Box } from '@mui/material';

export function CartItem({ item }) {
  const price = item.product.price * item.count;

  const { addCartItemMutation, removeCartItemMutation } = useCart();

  return (
    <Card
      className="CartItem"
      sx={(theme) => ({
        padding: theme.spacing(2),
        width: '90%',

        [theme.breakpoints.down('md')]: {
          paddingX: 0,
          paddingY: (theme) => theme.spacing(2),
        },
      })}
      variant="outlined"
    >
      <Stack
        justifyContent="space-between"
        alignItems="center"
        height="100%"
        spacing={2}
        sx={(theme) => ({
          flexDirection: 'row',

          [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
          },
        })}
      >
        <Box
          position="relative"
          height="100px"
          width="100px"
          sx={{
            '& img': {
              objectFit: 'contain',
            },
          }}
        >
          <Image src={item.product.image} alt={item.product.name} fill />
        </Box>
        <Stack direction="column" justifyContent="center" alignItems="center">
          <Typography variant="subtitle2" className="CartItem_Name">
            {item.product.name}
          </Typography>
          <Typography variant="body1" className="CartItem_Price">
            ${price}
          </Typography>
        </Stack>
        <Stack
          alignItems="center"
          justifyContent="space-evenly"
          sx={(theme) => ({
            flexDirection: 'column',

            [theme.breakpoints.down('md')]: {
              flexDirection: 'row',
            },
          })}
        >
          <IconButton
            className="CartItem_Remove"
            size="small"
            disabled={removeCartItemMutation.isLoading}
            onClick={() => removeCartItemMutation.mutate({ itemId: item.id })}
          >
            <Remove />
          </IconButton>

          <Typography variant="caption" className="CartItem_Count">
            {item.count}
          </Typography>
          <IconButton
            className="CartItem_Add"
            disabled={addCartItemMutation.isLoading}
            size="small"
            onClick={() => addCartItemMutation.mutate({ productId: item.product.id })}
          >
            <Add />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
}

export function Cart() {
  const { cartQuery } = useCart();

  const isLoading = cartQuery.isLoading || !cartQuery.isFetched;

  return (
    <Box
      sx={{
        maxHeight: !cartQuery.data?.size && !isLoading ? 'auto' : 300,
        minHeight: isLoading ? 50 : 'auto',
        width: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <Stack
        width="100%"
        direction="column"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: '100%',
        }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            {cartQuery.data?.size ? (
              cartQuery.data.data.map((item) => <CartItem item={item} key={item.id} />)
            ) : (
              <Typography variant="subtitle1">Your cart is empty</Typography>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}
