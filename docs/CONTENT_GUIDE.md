# 内容更新指南 · wotech.space

播客和手记都是 **markdown + git 推送** 模式：写一个 `.md` 文件，push 到 GitHub main 分支，Cloudflare Pages 自动重建，约 1 分钟后上线。没有后台、没有 CMS、没有数据库。

---

## 一、发一期播客

1. 复制 `docs/content-templates/podcast.md` 模板。
2. 在 `src/content/podcast/` 下新建文件，文件名即 URL slug，例如 `ep-01-linda.md` → 上线后地址是 `wotech.space/podcast/ep-01-linda/`。
3. 填好 frontmatter（标题、日期、音频链接等），正文写 shownotes。
4. `git add` + `git commit` + `git push`（本机 push 见下方"本机推送"）。
5. 等 Cloudflare Pages 构建完成，站点 + RSS 自动更新。

**字段说明**（frontmatter）：

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✅ | 期标题 |
| `pubDate` | ✅ | 发布日期 `YYYY-MM-DD` |
| `excerpt` |   | 一句摘要，列表/RSS 用 |
| `duration` |   | 时长 `28:15` |
| `audio` |   | mp3 直链（自托管/R2）；留空则页面不显播放器 |
| `season` |   | 季数，默认 1 |
| `hosts` |   | 主播列表，默认 `['Dai Min']` |
| `cover` |   | 封面图路径，如 `/podcast/ep-01.png`（放 `public/podcast/`） |
| `xiaoyuzhou` / `spotify` / `apple` |   | 外部平台链接，上线后再填 |
| `gatheringId` |   | 关联的聚会 id（双向联动用） |
| `comingSoon` |   | `true` = 创刊预告，不进 RSS，页面显"即将上线" |
| `draft` |   | `true` = 草稿，完全不渲染 |

**创刊预告**：当前 `src/content/podcast/coming-soon.md` 就是 `comingSoon: true` 的占位。第一期真正录好后，新建一个 `comingSoon: false`（或不写）的 .md 即可；预告页可保留或删除。

---

## 二、发一篇手记

1. 复制 `docs/content-templates/writing.md` 模板。
2. 在 `src/content/writing/` 下新建文件，例如 `linda-wine-shop.md` → `wotech.space/writing/linda-wine-shop/`。
3. frontmatter 填标题、日期、受访人信息、品牌链接；正文写长文（markdown 排版）。
4. push，等构建。

**手记方向**（杭州生活田野）：
- 杭州小店（开了十年的咖啡店、酒铺、手作店……）
- 徒步 / 散步线路（玉皇山、西湖群山、巷子线……）
- 有特色的地方（天目里、小河直街、某条巷子深处……）
- 田野访谈（以个体之名在这座城市做事的女性）

**字段说明**：

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✅ | 文章标题 |
| `pubDate` | ✅ | 发布日期 |
| `subject` |   | 主题，如 `杭州 · 小河直街` |
| `tags` |   | 标签数组，如 `[小店, 散步, 杭州]` |
| `excerpt` |   | 一句摘要 |
| `cover` |   | 封面图路径（受访者/店面照，**非 Dai Min 肖像**） |
| `interviewee` |   | 受访者对象（见下） |
| `comingSoon` / `draft` |   | 同播客 |

**`interviewee` 子字段**（写人时填，写线路/地方可不填）：

```yaml
interviewee:
  name: Linda           # 真名或化名（受访者定）
  role: 酒铺主理人       # 角色
  brand: 某某酒铺        # 品牌/工作室名
  location: 杭州 · 小河直街
  cover: /writing/linda.jpg
  links:                # 轻度品牌链接，每人不同，无固定模板
    - { label: 公众号, url: https://... }
    - { label: 小红书, url: https://... }
    - { label: 店面, url: https://... }
```

---

## 三、本机推送（git push 在这台机器上有 bug）

本机 git 2.55 的 `git push` 有已知 bug（报 "not a git repository"，仅 push 坏）。**绕过用 send-pack**：

```bash
cd "/c/Users/min.dai/Downloads/women-in-tech"
git add -A
git commit -m "content: 新一期播客/手记标题"
git send-pack --verbose "git@github.com:duoremifa/women-in-tech.git" refs/heads/main:refs/heads/main
```

或者直接在 GitHub 网页端新建文件提交——也走得通，只是慢一点。

---

## 四、图片放哪

所有图片放 `public/` 下对应子目录，frontmatter 里写**绝对路径**：

- 播客封面 → `public/podcast/ep-01.png` → frontmatter `cover: /podcast/ep-01.png`
- 手记封面 → `public/writing/linda.jpg` → `cover: /writing/linda.jpg`
- 作品截图 → `public/works/sound-field.jpg` → works.ts `cover: /works/sound-field.jpg`

建议宽度 1200–1600px，jpg/png/webp 均可。

---

## 五、本地预览

推送前想先看效果：

```bash
npm run dev    # 本地 http://localhost:4321
```

改完关掉，再 push。

---

## 六、构建检查

push 前如想确认无错：

```bash
npm run build    # 0 error 才推
```

Cloudflare Pages 构建失败会有邮件通知；本地跑过一遍最稳。
