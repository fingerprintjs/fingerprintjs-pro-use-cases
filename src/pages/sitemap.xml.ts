import { GetServerSideProps } from 'next';
import { HOMEPAGE_CARDS, PRODUCTION_URL } from '../client/components/common/content';

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${PRODUCTION_URL}</loc>
     </url>
     ${HOMEPAGE_CARDS.map(({ url }) => {
       return `
       <url>
           <loc>${`${PRODUCTION_URL}${url}`}</loc>
       </url>
     `;
     }).join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = generateSiteMap();

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
