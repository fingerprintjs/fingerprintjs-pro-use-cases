import { SITE_URL } from '../../shared/const';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { ArticleData } from '../../server/paywall/articles';
import { CustomPageProps } from '../_app';
import { USE_CASES } from '../../client/components/common/content';
import Image from 'next/image';
import { FunctionComponent } from 'react';
import styles from './paywall.module.scss';
import { useRouter } from 'next/router';

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
  const link = `/paywall/article/${article.id}${embed ? '/embed' : ''}`;
  const router = useRouter();
  return (
    <div className={styles.articleCard} onClick={() => router.push(link)}>
      <Image src={article.image} alt="" className={styles.articleCardImage} sizes="100vw" />
      <div className={styles.byline}>
        <Image src={article.author.avatar} className={styles.authorImage} alt={`Picture of ${article.author.name}`} />
        <div>{article.author.name}</div>
        <div>{article.date}</div>
      </div>
      <a href={link} key={article.id}>
        {article.title}
      </a>
      <p>{article.content}</p>
      <div>
        {article.tags.map((tag) => (
          <div key={tag}>{tag}</div>
        ))}
      </div>
    </div>
  );
};

type PaywallProps = CustomPageProps & {
  articles: ArticleData[];
};

export default function Paywall({ articles, embed }: PaywallProps) {
  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed} contentSx={{ maxWidth: 'none' }}>
      {articles && (
        <div className={styles.articles}>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} embed={embed} />
          ))}
        </div>
      )}
    </UseCaseWrapper>
  );
}
