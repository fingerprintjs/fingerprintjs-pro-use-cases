import { UserSearchHistoryDbModel } from '../../../server/personalization/database';
import { Op } from 'sequelize';
import { personalizationEndpoint } from '../../../server/personalization/personalization-endpoint';

// Endpoint for fetching user search history for given visitorId
export default personalizationEndpoint(async (_req, res, { usePersonalizedData, visitorId }) => {
  if (!usePersonalizedData) {
    return res.status(200).json({
      data: [],
      size: 0,
    });
  }

  if (!visitorId) {
    return res.status(400).json({
      error: 'Visitor ID not available',
    });
  }

  const history = await UserSearchHistoryDbModel.findAll({
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
