# 来源与开源说明

参考上游：https://github.com/Kareadita/Kavita

审阅版本：f75863cb77c0f6aa26e0794a1848294e63c9d07d（develop）。

src/pdf-reader.component.ts 的主题/单双页状态与切换逻辑源自Kavita的PDF阅读器组件，保留作者版权注释，按GPL-3.0-only提供。书架界面、PHP/SQLite后台、分块上传与维护脚本为轻量家庭实现，未复用Kavita的.NET/EF后台。这不是完整Kavita或其官方发行。

Angular、ngx-extended-pdf-viewer与PDF.js保留各自许可证。构建会复制相关许可证到public/licenses。本仓库包含构建所需应用源码；第三方依赖通过npm与package-lock.json获取。
