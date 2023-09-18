import { SITE_URL } from '../../shared/const';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { ArticleData } from '../../server/paywall/articles';
import { CustomPageProps } from '../_app';
import { USE_CASES } from '../../client/components/common/content';
import Image from 'next/image';
import { FunctionComponent } from 'react';

export async function getServerSideProps() {
  const articlesResponse = await fetch(`${SITE_URL}/api/paywall/get-articles`).then((res) => res.json());

  return {
    props: {
      articles: articlesResponse.data,
    },
  };
}

type ArticleCardProps = {
  article: ArticleData;
  embed?: boolean;
};
const ArticleCard: FunctionComponent<ArticleCardProps> = ({ article, embed }) => {
  return (
    <a href={`/paywall/article/${article.id}${embed ? '/embed' : ''}`} key={article.id}>
      <Image src={article.image} alt="" />
      <div>
        <Image src={article.author.avatar} alt={`Picture of ${article.author.name}`} />
        <div>{article.author.name}</div>
        <div>{article.date}</div>
      </div>
      <h3>{article.title}</h3>
      <p>{article.content}</p>
      <div>
        {article.tags.map((tag) => (
          <div key={tag}>{tag}</div>
        ))}
      </div>
    </a>
  );
};

type PaywallProps = CustomPageProps & {
  articles: ArticleData[];
};

export default function Paywall({ articles, embed }: PaywallProps) {
  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed} contentSx={{ maxWidth: 'none' }}>
      {articles && (
        <div>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} embed={embed} />
          ))}
        </div>
      )}
    </UseCaseWrapper>
  );
}
