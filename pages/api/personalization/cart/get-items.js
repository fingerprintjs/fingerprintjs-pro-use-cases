import { personalizationEndpoint } from '../personalization-endpoint';
import { UserCartItem } from '../database';
import { Op } from 'sequelize';

export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
  if (!usePersonalizedData) {
    return res.status(400);
  }

  const cartItems = await UserCartItem.findAll({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
    order: [['timestamp', 'DESC']],
  });

  return res.status(200).json({
    data: cartItems,
    size: cartItems.length,
  });
});
