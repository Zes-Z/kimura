# 项目定位：拥有丰富展示动画效果和超高交互对象的单页式astro博客

## 可参考资源
https://justinschueler.com/projects
https://helloabdullah.com/?ref=onepagelove#beyond-work
https://angelo.so/?ref=onepagelove


## SOP
1. 仔细阅读、浏览可参考的资源项目
2. 根据项目的页面显示需求和动画实现要求，优先寻找参考资源中相同或相近的显示效果，构建大致页面架构
3. 寻找参考资源的对应实现的代码，优化并使用


## 本项目的页面幅及对应内容
1. 首页第一幅分为上下两部分，上半部分为图像区，下半区为信息区。居中展示个人头像，另起行展示基础个人信息（姓名·年龄）、地址·网页链接、座右铭、社交图标、简历
2. 第二幅展示实习/项目经历
3. 第三幅为生活图片区
4. 第四幅为随想区
5. 尾幅为个人扩展区


## 页面画幅的动画实现
1. 整体使用纯浅白色背景板，各个画幅的切换动画要高级且丰富
2. 第一幅中座右铭为列表对象，动画使用键盘打字效果，整句话展示3秒后使用光标删除动画，1秒后切换下一句
3. 第一幅向下滑动到第二幅时，第一幅的头像柔和地缩小到页面左上角，并持续存在。将左上角头像设置为列表对象，点击时弹出“社交账号图标”、“邮箱图标”、“简历图标”，且均为可跳转的链接对象，当检测到页面划动或其他区域的鼠标点击事件时，收回弹出对象。弹出和收回动画都要柔和，但不要拖沓。
4. 第二幅的实习/项目经历 动画为：横向播放的图片，具体动画效果参照https://helloabdullah.com/?ref=onepagelove#beyond-work 的Recent Projects section以及https://justinschueler.com/projects的Projects section 。点击后渲染实习/项目对应的.md文件。这一幅务必完美复现。
5. 第三幅生活图片区的对象主要是图片，可能会有少量iphone拍摄的实况图片或者短视频对象。具体动画效果参照https://justinschueler.com/?ref=onepagelove Thoughts section下方的图片区，这一幅务必完美复现。
6. 第四幅的随想区为可展示图片封面的.md对象，图片边框可采用那种裁剪邮票、数码相机边框等各种展示效果。我这里只列了两种，你需要尽可能的丰富图片展示边框，3-6种展示效果为宜。
7. 尾幅的动画和展示效果参照https://justinschueler.com/?ref=onepagelove 页面的最下方或者https://helloabdullah.com/#recent-work 这个最下方的展示效果。你任选其一，或者融合，取二者精华，去其糟粕


## 本项目的文件框架
1. 文件结构扁平化存放。首页个人头像、图片和kim cv.pdf等文件存放在public中
2. src/content/post文件夹用于存放随想区中的文件对象，例如src/content/post/future thought/xx.jpg、xxx.md；src/content/picture存放生活图片区以及一个photometa.json用作记录export图片的元信息；src/content/internship·project存放第二幅展示的文件夹对象，例如src/content/internship·project/teacher/xx.jpg、xxx.md。src/components用于存放各种组件。其他文件结构你可以按照普遍的astro项目实现来做
3. 主页第一幅的两个部分的比例设置、头像设置、博客的链接等，各种可自定义的设置优先集成到siteconfig.ts中


## 技术路径
你可以使用任何稳定且普遍的astro包以及各种语言，优先保证项目的整体完成度以及动画实现和质量，这是最重要的。



## 博客之禅
1. 化繁为简，简中现繁
2. 博采众长，融会贯通，化为己用
3. 随心所欲