import { sequelize } from '../server';
import { DataTypes } from 'sequelize';

export const Visit = sequelize.define('visit', {
  visitorId: {
    type: DataTypes.STRING,
  },
  linkedId: {
    type: DataTypes.STRING,
  },
  visits: {
    type: DataTypes.JSON,
  },
});

let didInit = false;

export async function initPresentationDemo() {
  if (didInit) {
    return;
  }

  await Visit.sync();
}
