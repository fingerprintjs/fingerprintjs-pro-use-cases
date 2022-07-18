import { personalizationEndpoint } from '../personalization-endpoint';
import { UserCartItem } from '../database';
import { Op } from 'sequelize';

export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
  if (!usePersonalizedData) {
    return res.status(400);
  }

  const { productId } = JSON.parse(req.body);

  const [cartItem, created] = UserCartItem.findOrCreate({
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
