// src/pages/gatherings/[id].ics.ts
// 单期 .ics 直订（build 期预渲染，每期一个文件）。/upcoming "加日历"按钮直链此文件。
// 真实日期，所见即所订。

import type { APIRoute, GetStaticPaths } from 'astro';
import { GATHERINGS, type Gathering } from '../../data/gatherings';
import { generateSingleICS } from '../../lib/join-shared';

export const getStaticPaths: GetStaticPaths = () => {
  return GATHERINGS.filter(g => g.status !== 'past').map(g => ({
    params: { id: g.id },
    props: { g },
  }));
};

export const GET: APIRoute<{ g: Gathering }> = ({ props }) => {
  const ics = generateSingleICS(props.g);
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Content-Disposition': `inline; filename="${props.g.id}.ics"`,
    },
  });
};
