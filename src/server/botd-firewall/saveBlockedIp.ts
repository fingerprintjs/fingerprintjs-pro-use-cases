import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../server';

interface BlockedIpAttributes
  extends Model<InferAttributes<BlockedIpAttributes>, InferCreationAttributes<BlockedIpAttributes>> {
  ip: string;
  timestamp: string;
}

export const BlockedIpDbModel = sequelize.define<BlockedIpAttributes>('blocked_ips', {
  ip: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

BlockedIpDbModel.sync({ force: false });

export type BlockedIp = Attributes<BlockedIpAttributes>;

export const saveBlockedIp = async (ip?: string) => {
  if (!ip) {
    return;
  }

  BlockedIpDbModel.upsert({
    ip,
    timestamp: new Date().toISOString(),
  });
};

export const deleteBlockedIp = async (ip?: string) => {
  if (!ip) {
    return;
  }

  BlockedIpDbModel.destroy({
    where: {
      ip,
    },
  });
};
