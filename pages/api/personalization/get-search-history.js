import { UserSearchHistory } from '../../../server/personalization/database';
import { Op } from 'sequelize';
import { personalizationEndpoint } from '../../../server/personalization/personalization-endpoint';

// Endpoint for fetching user search history for given visitorId
export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
  if (!usePersonalizedData) {
    return res.status(200).json({
      data: [],
      size: 0,
    });
  }

  const history = await UserSearchHistory.findAll({
    order: [['timestamp', 'DESC']],
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
  });

  return res.status(200).json({
    data: history,
    size: history.length,
  });
});
