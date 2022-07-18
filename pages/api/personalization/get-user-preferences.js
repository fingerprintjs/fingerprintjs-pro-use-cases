import { UserPreferences } from './database';
import { Op } from 'sequelize';
import { personalizationEndpoint } from './personalization-endpoint';

export default personalizationEndpoint(async (req, res, { visitorId, usePersonalizedData }) => {
  if (!usePersonalizedData) {
    return res.status(404).json({
      data: null,
    });
  }

  const result = await UserPreferences.findOne({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
  });

  if (!result) {
    return res.status(404).json({
      data: null,
    });
  }

  return res.status(200).json({
    data: result,
  });
});
