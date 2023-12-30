import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../server';
import { EventResponseBotData } from '../../shared/types';

interface BotIPAttributes extends Model<InferAttributes<BotIPAttributes>, InferCreationAttributes<BotIPAttributes>> {
  visitorId: string;
  requestId: string;
  ip: string;
  timestamp: string;
  botResult: string;
  botType: string;
  url: string;
  userAgent: string;
}

export const BotVisitDbModel = sequelize.define<BotIPAttributes>('botIp', {
  visitorId: {
    type: DataTypes.STRING,
  },
  requestId: {
    type: DataTypes.STRING,
  },
  ip: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
  botResult: {
    type: DataTypes.STRING,
  },
  botType: {
    type: DataTypes.STRING,
  },
  url: {
    type: DataTypes.STRING,
  },
  userAgent: {
    type: DataTypes.STRING,
  },
});

BotVisitDbModel.sync({ force: false });

export type BotIp = Attributes<BotIPAttributes>;

export const saveBotVisit = async (botData: EventResponseBotData, visitorId: string) => {
  if (!botData) {
    return;
  }

  BotVisitDbModel.create({
    ip: botData.ip,
    visitorId: visitorId,
    requestId: botData.requestId ?? 'N/A',
    timestamp: botData.time ?? 'N/A',
    botResult: botData.bot.result ?? 'N/A',
    botType: botData.bot.type ?? 'N/A',
    userAgent: botData.userAgent ?? 'N/A',
    url: botData.url ?? 'N/A',
  });
};
