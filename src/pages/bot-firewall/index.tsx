import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { NextPage } from 'next';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';

export const BotFirewall: NextPage<CustomPageProps> = ({ embed }) => {
  return (
    <>
      <UseCaseWrapper useCase={USE_CASES.botFirewall} embed={embed} contentSx={{ maxWidth: 'none' }}>
        Hello world
      </UseCaseWrapper>
    </>
  );
};

export default BotFirewall;
