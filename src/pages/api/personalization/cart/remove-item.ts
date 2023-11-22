import { personalizationEndpoint } from '../../../../server/personalization/personalization-endpoint';
import { UserCartItemDbModel } from '../../../../server/personalization/database';
import { Op } from 'sequelize';

// Removes an item from cart for given visitorId
export default personalizationEndpoint(async (req, res, { usePersonalizedData }) => {
  if (!usePersonalizedData) {
    return res.status(400);
  }

  let removed = false;

  const { itemId } = JSON.parse(req.body);

  const item = await UserCartItemDbModel.findOne({
    where: {
      id: {
        [Op.eq]: itemId,
      },
    },
  });

  if (!item) {
    return res.status(400).json({
      error: 'Item not found',
    });
  }

  item.count--;

  if (item.count <= 0) {
    removed = true;

    await item.destroy();
  } else {
    await item.save();
  }

  return res.status(200).json({
    data: item,
    removed,
  });
});
