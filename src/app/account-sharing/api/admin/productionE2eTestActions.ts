import { SessionDbModel, UserDbModel } from '../database';
import { hashString } from '../../../../server/server-utils';

export const TEST_USER = {
  username: 'e2eTestUser',
  password: 'e2eTestPassword',
};

export const ensureTestUserExists = async () => {
  const { username, password } = TEST_USER;
  await UserDbModel.findOrCreate({
    where: { username },
    defaults: { username, passwordHash: hashString(password), createdWithVisitorId: '' },
  });
};

export const deleteTestUser = async () => {
  await UserDbModel.destroy({ where: { username: TEST_USER.username } });
};

export const logOutTestUserEverywhere = async () => {
  await SessionDbModel.destroy({ where: { username: TEST_USER.username } });
};

export const productionE2eTestActions = {
  ensureTestUserExists,
  deleteTestUser,
  logOutTestUserEverywhere,
} as const;

export type ProductionE2eTestActionName = keyof typeof productionE2eTestActions;
