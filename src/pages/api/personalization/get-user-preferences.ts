import { UserPreferences } from '../../../server/personalization/database';
import { Op } from 'sequelize';
import { personalizationEndpoint } from '../../../server/personalization/personalization-endpoint';
import { NextApiRequest, NextApiResponse } from 'next';

// Fetches user preferences (for now only dark mode preference) for given visitorId
export default personalizationEndpoint(
  async (req: NextApiRequest, res: NextApiResponse, { visitorId, usePersonalizedData }) => {
    if (!usePersonalizedData) {
      return res.status(200).json({
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
      return res.status(200).json({
        data: null,
      });
    }

    return res.status(200).json({
      data: result,
    });
  },
);
