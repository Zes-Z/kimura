# Kimura

Astro 单页个人博客。首页包含介绍、横向项目轨道、影像叠层、随想封面与联系区；项目和随想有独立 Markdown 详情页。

## 启动

```sh
pnpm install
pnpm dev
pnpm build
```

## 更换内容

- `src/siteconfig.ts`：姓名、年龄、地址、座右铭、社交链接、头像、简历地址、首页图像区比例。填入真实信息后再发布。
- `public/`：仅放头像、PDF 简历、CSS 和浏览器脚本等需要固定 URL 的文件；头像和简历路径在 `src/siteconfig.ts` 中设置。
- `src/content/internship·project/<slug>/`：每个项目的 `index.md` 与封面放在同一文件夹。frontmatter 使用相对路径，例如 `cover: ./project-01.svg`。
- `src/content/post/<slug>/`：每篇随想的 `index.md` 与封面放在同一文件夹，`cover` 同样使用 `./文件名`。正文图片也可放在该文件夹，用 Markdown 相对路径引用。
- `src/content/picture/`：生活影像与 `photometa.json` 放在一起。元数据中的 `src` 使用相对路径，例如 `./photo-01.svg`；短视频可设置 `type: "video"`，支持 `mp4`、`webm` 或 `mov`。无需复制图片到 `public/`。

仓库中的人物信息、文章、项目和画面均为示例，不代表真实履历。发布前请替换。
