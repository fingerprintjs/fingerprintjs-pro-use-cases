import {
  Attributes,
  CreationOptional,
  DataTypes,
  FindOptions,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { sequelize } from '../../../../server/sequelize';
import { Event } from '@fingerprint/node-sdk';
import { redactId } from './redactId';

interface BotVisitAttributes
  extends Model<InferAttributes<BotVisitAttributes>, InferCreationAttributes<BotVisitAttributes>> {
  id: CreationOptional<number>;
  visitorId: string;
  eventId: string;
  ip: string;
  timestamp: string;
  botResult: string;
  botType: string;
  url: string;
  userAgent: string;
}

const BotVisitDbModel = sequelize.define<BotVisitAttributes>('bot_visits', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  visitorId: {
    type: DataTypes.STRING,
  },
  eventId: {
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

export type BotVisit = Attributes<BotVisitAttributes>;

export const saveBotVisit = async (eventData: Event, visitorId: string) => {
  BotVisitDbModel.create({
    ip: eventData.ip_address ?? '',
    visitorId: visitorId,
    eventId: eventData.event_id,
    timestamp: new Date(eventData.timestamp).toISOString(),
    botResult: eventData.bot ?? 'not_detected',
    botType: eventData.bot_type ?? '',
    userAgent: eventData.user_agent ?? '',
    url: eventData.url ?? '',
  });
};

export const getBotVisits = async (limit?: number): Promise<BotVisit[]> => {
  const options: FindOptions = {
    order: [['timestamp', 'DESC']],
  };
  if (limit) {
    options.limit = limit;
  }
  const rows = await BotVisitDbModel.findAll(options);
  return rows.map((row) => {
    const visit = row.get({ plain: true });
    return {
      ...visit,
      eventId: redactId(visit.eventId),
      visitorId: redactId(visit.visitorId),
    };
  });
};
