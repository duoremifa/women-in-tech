import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const PODCAST_NAME = '慢谈 · Slow Talk';
const SITE = 'https://wotech.space';
const RSS_URL = `${SITE}/podcast/rss.xml`;

export const GET: APIRoute = async () => {
  const episodes = (
    await getCollection('podcast', ({ data }) => !data.draft && !data.comingSoon)
  ).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const items = episodes
    .map(ep => {
      const guid = `${SITE}/podcast/${ep.id}/`;
      const pub = ep.data.pubDate.toUTCString();
      const enclosure = ep.data.audio
        ? `<enclosure url="${ep.data.audio}" length="0" type="audio/mpeg" />`
        : '';
      const dur = ep.data.duration ? `<itunes:duration>${ep.data.duration}</itunes:duration>` : '';
      return [
        '<item>',
        `<title><![CDATA[${ep.data.title}]]></title>`,
        `<link>${guid}</link>`,
        `<guid isPermaLink="true">${guid}</guid>`,
        `<pubDate>${pub}</pubDate>`,
        enclosure,
        dur,
        `<itunes:summary><![CDATA[${ep.data.excerpt || ep.data.title}]]></itunes:summary>`,
        '</item>',
      ].join('\n');
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${PODCAST_NAME}]]></title>
    <link>${SITE}/podcast/</link>
    <atom:link href="${RSS_URL}" rel="self" type="application/rss+xml" />
    <language>zh-CN</language>
    <description><![CDATA[相聚之后，留下一段实录。不修饰，不剪辑。]]></description>
    <image>
      <url>${SITE}/og-image.png</url>
      <title><![CDATA[${PODCAST_NAME}]]></title>
      <link>${SITE}/podcast/</link>
    </image>
    <itunes:author>Dai Min</itunes:author>
    <itunes:owner>
      <itunes:name>Dai Min</itunes:name>
      <itunes:email>invitation@wotech.space</itunes:email>
    </itunes:owner>
    <itunes:image href="${SITE}/og-image.png" />
    <itunes:category text="Society &amp; Culture" />
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
