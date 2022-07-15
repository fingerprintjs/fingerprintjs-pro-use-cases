import { initProducts, UserSearchHistory } from './database';
import { ensurePostRequest } from '../../../shared/server';
import { validatePersonalizationRequest } from './shared';
import { Op } from 'sequelize';

export default async function handler(req, res) {
  if (!ensurePostRequest(req, res)) {
    return;
  }

  await initProducts();

  res.setHeader('Content-Type', 'application/json');

  const { usePersonalizedData, visitorId } = await validatePersonalizationRequest(req, res);

  if (!usePersonalizedData) {
    return res.status(404).json({
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
}
