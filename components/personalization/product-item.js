import Image from 'next/image';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { useCart } from '../../shared/client/api/use-cart';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import { useDebounce } from 'react-use';
import { Check } from '@mui/icons-material';
import { usePersonalizationNotification } from '../../hooks/use-personalization-notification';

export function ProductItem({ product: { price, name, image, id } }) {
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
    [wasAdded]
  );

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
          fullWidth
          startIcon={wasAdded ? <Check /> : undefined}
          loading={addCartItemMutation.isLoading}
          onClick={async () => {
            await addCartItemMutation.mutateAsync({ productId: id });

            showNotification('Product added to cart!');

            setWasAdded(true);
          }}
          variant="contained"
          color={wasAdded ? 'success' : 'primary'}
        >
          {wasAdded ? 'Added' : 'Add to cart'}
        </LoadingButton>
      </CardActions>
    </Card>
  );
}
