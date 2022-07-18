import { useCart } from './api/use-cart';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
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
      sx={{
        padding: (theme) => theme.spacing(2),
        width: '90%',
      }}
      variant="outlined"
    >
      <Stack direction="row" justifyContent="space-between" height="100%">
        <Image
          src={item.product.image}
          height="100%"
          width="100%"
          alt={item.product.name}
          objectFit="cover"
          layout="fixed"
        />
        <Stack direction="column" justifyContent="center">
          <Typography variant="subtitle2">{item.product.name}</Typography>
          <Typography variant="body1">${price}</Typography>
        </Stack>
        <Stack direction="column" alignItems="center" justifyContent="space-evenly">
          <IconButton
            disabled={addCartItemMutation.isLoading}
            size="small"
            onClick={() => addCartItemMutation.mutate({ productId: item.product.id })}
          >
            <Add />
          </IconButton>
          <Typography variant="caption">{item.count}</Typography>
          <IconButton
            size="small"
            disabled={removeCartItemMutation.isLoading}
            onClick={() => removeCartItemMutation.mutate({ itemId: item.id })}
          >
            <Remove />
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
        height: 400,
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
        justifyContent={cartQuery.data?.size ? 'flex-start' : 'center'}
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
