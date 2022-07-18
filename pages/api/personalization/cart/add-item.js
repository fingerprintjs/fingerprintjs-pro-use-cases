import { personalizationEndpoint } from '../../../../api/personalization/personalization-endpoint';
import { Product, UserCartItem } from '../../../../api/personalization/database';
import { Op } from 'sequelize';

export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
  if (!usePersonalizedData) {
    return res.status(400);
  }

  const { productId } = JSON.parse(req.body);

  const product = await Product.findOne({
    where: {
      id: {
        [Op.eq]: productId,
      },
    },
  });

  if (!product) {
    return res.status(500).json({
      error: new Error('Product not found'),
    });
  }

  const [cartItem, created] = await UserCartItem.findOrCreate({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
      productId: {
        [Op.eq]: productId,
      },
    },
    defaults: {
      visitorId,
      count: 1,
      timestamp: new Date(),
      productId,
    },
  });

  if (!created) {
    cartItem.count++;

    await cartItem.save();
  }

  return res.status(200).json({
    data: cartItem,
  });
});
