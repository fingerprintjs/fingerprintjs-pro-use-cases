import Image from 'next/image';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { useCart } from './api/use-cart';
import { LoadingButton } from '@mui/lab';

export function ProductItem({ product: { price, name, image, id } }) {
  const { addCartItemMutation } = useCart();

  return (
    <Card
      variant="outlined"
      style={{
        width: '100%',
        position: 'relative',
      }}
    >
      <CardMedia
        component={() => (
          <Image src={image} height="100%" width="100%" alt={name} objectFit="cover" layout="responsive" />
        )}
      />
      <CardContent>
        <Typography gutterBottom variant="h5">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ${price.toFixed(2)}
        </Typography>
      </CardContent>
      <CardActions>
        <LoadingButton
          loading={addCartItemMutation.isLoading}
          onClick={() => addCartItemMutation.mutate({ productId: id })}
          variant="contained"
          color="primary"
        >
          Add to cart
        </LoadingButton>
      </CardActions>
    </Card>
  );
}
