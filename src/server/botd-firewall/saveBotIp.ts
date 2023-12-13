import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../server';
import { EventResponseBotData } from '../../pages/api/web-scraping/flights';

interface BotIPAttributes extends Model<InferAttributes<BotIPAttributes>, InferCreationAttributes<BotIPAttributes>> {
  visitorId: string;
  requestId: string;
  ip: string;
  timestamp: Date;
  botResult: string;
  botType: string;
  url: string;
  userAgent: string;
}

export const BotIpDbModel = sequelize.define<BotIPAttributes>('botIp', {
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

BotIpDbModel.sync({ force: false });

export type BotIp = Attributes<BotIPAttributes>;

export const saveBotIp = async (botData: EventResponseBotData, visitorId: string) => {
  if (!botData) {
    return;
  }

  console.log('saving');

  BotIpDbModel.create({
    ip: botData.ip,
    visitorId: visitorId,
    requestId: botData.requestId ?? 'N/A',
    timestamp: new Date(),
    botResult: botData.bot.result ?? 'N/A',
    botType: botData.bot.type ?? 'N/A',
    userAgent: botData.userAgent ?? 'N/A',
    url: botData.url ?? 'N/A',
  });
};
