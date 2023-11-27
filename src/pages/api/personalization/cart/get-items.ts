import { personalizationEndpoint } from '../../../../server/personalization/personalization-endpoint';
import { UserCartItem, ProductDbModel, UserCartItemDbModel } from '../../../../server/personalization/database';
import { Op } from 'sequelize';

// Returns cart items for the given visitorId
export default personalizationEndpoint(async (_req, res, { usePersonalizedData, visitorId }) => {
  if (!usePersonalizedData) {
    return res.status(200).json({
      data: [],
      size: 0,
    });
  }

  if (!visitorId) {
    return res.status(400).json({
      error: 'Visitor ID not found',
    });
  }

  const cartItems = (await UserCartItemDbModel.findAll({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
    order: [['timestamp', 'DESC']],
    include: ProductDbModel,
    // To-do: Clean this up later, find out how to represent DB associations in TypeScript correctly
  })) as unknown as UserCartItem[];

  return res.status(200).json({
    data: cartItems,
    size: cartItems.length,
  });
});
