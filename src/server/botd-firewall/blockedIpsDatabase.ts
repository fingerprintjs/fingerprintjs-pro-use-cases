import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../server';
import { MAX_BLOCKED_IPS } from './buildFirewallRules';

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

export const getBlockedIps = async (): Promise<string[]> => {
  const blockedIps = await BlockedIpDbModel.findAll({
    order: [['timestamp', 'DESC']],
    limit: MAX_BLOCKED_IPS,
  });
  return blockedIps.map((ip) => ip.ip);
};

export const saveBlockedIp = async (ip: string) => {
  return BlockedIpDbModel.upsert({
    ip,
    timestamp: new Date().toISOString(),
  });
};

export const deleteBlockedIp = async (ip: string) => {
  return BlockedIpDbModel.destroy({
    where: {
      ip,
    },
  });
};
