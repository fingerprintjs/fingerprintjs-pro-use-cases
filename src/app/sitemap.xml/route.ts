import { HOMEPAGE_CARDS, PRODUCTION_URL } from '../../client/components/common/content';
import { NextResponse } from 'next/server';

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

export async function GET() {
  const sitemap = generateSiteMap();

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
