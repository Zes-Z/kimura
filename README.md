# Kimura

Astro 单页个人博客。首页包含介绍、横向项目轨道、影像叠层、随想封面与联系区；项目和随想有独立 Markdown 详情页。

## 启动

```sh
npm install
npm run dev
npm run build
```

## 更换内容

- `src/siteconfig.ts`：姓名、年龄、地址、座右铭、社交链接、头像、简历地址、首页图像区比例。填入真实信息后再发布。
- `public/`：放头像、项目与随想封面，以及 `kim-cv.pdf`。填入简历后，将 `siteconfig.ts` 中的 `resume` 改为 `/kim-cv.pdf`。
- `src/content/internship·project/<slug>/index.md`：项目和实习经历。封面路径在 frontmatter 的 `cover` 中设置。
- `src/content/post/<slug>/index.md`：随想。`frame` 支持 `stamp`、`camera`、`polaroid`、`ticket`、`folio`。
- `src/content/picture/photometa.json`：生活影像的展示顺序、路径和说明。当前图片为示意素材，替换时将文件放进此文件夹，并将可公开访问的副本放进 `public/`。短视频可设置 `type: "video"`，叠层会在当前页播放并在切换后暂停。

仓库中的人物信息、文章、项目和画面均为示例，不代表真实履历。发布前请替换。
