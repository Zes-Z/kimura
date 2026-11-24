# Kimura

Astro 单页个人博客。首页依次为自定义图片或视频、Journey 影像环形轮播、Margin Notes 可撕票根文章墙与联系尾幅；随想保留独立 Markdown 详情页。

## 启动

```sh
pnpm install
pnpm dev
pnpm build
```

## 更换内容

- `src/siteconfig.ts`：修改姓名、链接和 `heroMedia`。默认首页图来自 `src/content/picture/photo-04.svg`；替换图片时把 `type` 设为 `image`，视频设为 `video`。视频推荐 MP4 或 WebM，并设置同目录下的 `poster` 静帧。可用 `objectPosition` 调整裁切焦点，`heroImageRatio` 调整首幅上下区比例。
- `src/content/picture/`：首页媒体与 Journey 的影像保存在这里。首页配置中的路径写为 `./文件名`，构建时自动处理；也支持 `public/` 中以 `/` 开头的路径或完整的远程 URL。Journey 的顺序与标题在 `photometa.json` 设置，轮播读取图片自身宽高比，以同一高度展示 3:2、2:3、1:1 等比例，并可点击打开大图。
- `src/content/post/<slug>/`：每篇随想的 `index.md` 与封面放在同一文件夹，`cover` 使用相对路径。文章数量增加后，票根墙自动换行，并在窄屏改成两列或一列。
- `public/`：仅放头像、PDF 简历、CSS 和浏览器脚本等需要固定 URL 的文件。头像和简历路径也在 `src/siteconfig.ts` 中设置。

仓库中的人物信息、文章和画面均为示例，请在发布前替换。

Journey 轮播参考 [React Bits Circular Carousel](https://reactbits.dev/components/circular-carousel) 的圆环几何与拖动惯性，并按 Astro 与不同图片宽度改写。许可与署名见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
