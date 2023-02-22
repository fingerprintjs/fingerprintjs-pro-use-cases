import Image from 'next/image';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import { useCart } from '../../api/personalization/use-cart';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import { useDebounce } from 'react-use';
import { Check } from '@mui/icons-material';
import { usePersonalizationNotification } from '../../hooks/personalization/use-personalization-notification';

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
      className="ProductCard"
      variant="outlined"
      style={{
        width: '100%',
        position: 'relative',
      }}
    >
      <CardMedia
        component={() => (
          <Box
            position="relative"
            width="100%"
            height="100px"
            sx={{
              '& img': {
                objectFit: 'cover',
              },
            }}
          >
            <Image src={image} alt={name} fill />
          </Box>
        )}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" className="ProductCard_Name">
          {name}
        </Typography>
        <Typography data-price={price} variant="body2" color="text.secondary" className="ProductCard_Price">
          ${price.toFixed(2)}
        </Typography>
      </CardContent>
      <CardActions>
        <LoadingButton
          className="ProductCard_AddToCart"
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
