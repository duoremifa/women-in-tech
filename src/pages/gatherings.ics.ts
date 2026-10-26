// src/pages/gatherings.ics.ts
// webcal 日历源（build 期预渲染）。系统日历订阅 webcal://wotech.space/gatherings.ics
// 一次，自动同步未过期排期；过期项自动滚出。零后端、零打扰。

import type { APIRoute } from 'astro';
import { upcomingGatherings } from '../data/gatherings';
import { generateCalendarFeed } from '../lib/join-shared';

export const GET: APIRoute = () => {
  const items = upcomingGatherings(new Date());
  const ics = generateCalendarFeed(items);
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Content-Disposition': 'inline; filename="gatherings.ics"',
    },
  });
};
