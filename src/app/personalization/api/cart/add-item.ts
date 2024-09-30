import { personalizationEndpoint } from '../../../../server/personalization/personalization-endpoint';
import { ProductDbModel, UserCartItemDbModel } from '../../../../server/personalization/database';
import { Op } from 'sequelize';

// Adds an item to cart for the given visitorId
export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
  if (!usePersonalizedData) {
    return res.status(400);
  }

  const { productId } = JSON.parse(req.body);

  const product = await ProductDbModel.findOne({
    where: {
      id: {
        [Op.eq]: productId as string,
      },
    },
  });

  if (!product) {
    return res.status(500).json({
      error: new Error('Product not found'),
    });
  }

  const [cartItem, created] = await UserCartItemDbModel.findOrCreate({
    where: {
      visitorId: {
        [Op.eq]: visitorId ?? '',
      },
      productId: {
        [Op.eq]: productId,
      },
    },
    defaults: {
      visitorId: visitorId ?? '',
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
