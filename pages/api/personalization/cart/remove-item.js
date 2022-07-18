import { personalizationEndpoint } from '../personalization-endpoint';
import { UserCartItem } from '../database';
import { Op } from 'sequelize';

export default personalizationEndpoint(async (req, res, { usePersonalizedData }) => {
  if (!usePersonalizedData) {
    return res.status(400);
  }

  const itemId = req.params.itemId;

  await UserCartItem.destroy({
    where: {
      id: {
        [Op.eq]: itemId,
      },
    },
  });
  return res.status(200).json({
    data: true,
  });
});
