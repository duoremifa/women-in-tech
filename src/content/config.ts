import { defineCollection, z } from 'astro:content';

// 播客期次（wotech.space/podcast，女性社群对谈实录方向）
const podcast = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    duration: z.string().optional(),        // itunes:duration, e.g. '28:15'
    audio: z.string().url().optional(),     // mp3 直链（自托管/R2）
    excerpt: z.string().optional(),         // 一句摘要
    season: z.number().default(1),
    hosts: z.array(z.string()).default(['Dai Min']),
    // 外部分发平台（可选，未上线则留空）
    xiaoyuzhou: z.string().url().optional(),
    spotify: z.string().url().optional(),
    apple: z.string().url().optional(),
    cover: z.string().optional(),          // 封面图路径
    draft: z.boolean().default(false),
    comingSoon: z.boolean().default(false), // 创刊预告/未上线标记
  }),
});

// 田野长文（深度访谈独立女性创造者）
const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    subject: z.string().optional(),        // 采访对象/主题
    tags: z.array(z.string()).default([]),
    excerpt: z.string().optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    comingSoon: z.boolean().default(false),
  }),
});

export const collections = { podcast, writing };
