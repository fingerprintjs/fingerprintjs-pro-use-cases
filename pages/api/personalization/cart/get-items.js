import { personalizationEndpoint } from '../../../../api/personalization/personalization-endpoint';
import { Product, UserCartItem } from '../../../../api/personalization/database';
import { Op } from 'sequelize';

// Returns cart items for the given visitorId
export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
  if (!usePersonalizedData) {
    return res.status(200).json({
      data: [],
      size: 0,
    });
  }

  const cartItems = await UserCartItem.findAll({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
    order: [['timestamp', 'DESC']],
    include: Product,
  });

  return res.status(200).json({
    data: cartItems,
    size: cartItems.length,
  });
});
