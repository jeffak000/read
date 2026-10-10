# Read · 家庭 PDF 书架

简洁的中文 PDF 书架，适合家庭局域网与 iPad。Angular + PDF.js + PHP 8.2 + SQLite，适配群晖 nginx/Web 目录，不需要 Docker、云服务或 HTTPS。

## 功能

- 免登录阅读；管理员批量上传、修改书名分类、确认删除。
- PDF书名/首页封面识别、搜索分类、继续阅读、缩放、明暗主题和单双页。
- 每块4 MiB上传，不设30 MB应用上限；仍受磁盘和设备资源限制。
- 访客进度保存在浏览器，登录账号进度保存在SQLite；登录有效期7天。
- 管理员健康检查；每月SQLite在线备份与封面备份，保留最近5份；每日清理超过24小时的上传残留。

扫描导入、文件哈希去重、标签、拼音搜索和家长统计尚未实现。不是完整版Kavita。

## 构建

需要Node.js及npm：
```sh
npm ci
npm run build
```
`public/` 为部署文件。第三方依赖由package-lock.json锁定。开源发行需同时提供此仓库源码和第三方许可证，不包含图书和运行数据。

## 群晖部署

先备份已有网站和数据，不要覆盖其他项目。安装官方PHP 8.2；复制public到 `/volume1/web/read-local`。数据目录 `/var/lib/read-local`（http用户可写，禁止通过网页访问），PDF目录 `/volume1/download/book`。运行配置php.ini、fpm.conf、read-local.service为示例，需按你的实际PHP路径和IP调整。nginx示例使用9080端口，只绑定家庭NAS地址，PDF/API走同源。

创建数据目录、covers、parts目录并授予http用户权限。使用init.php初始化：通过stdin提供JSON对象，字段username、password（自行选择强密码），不得将密码写入公开文件。该脚本只在不存在管理员时创建管理员，不重置现有账号。执行身份应为http：
```sh
/var/packages/PHP8.2/target/usr/local/bin/php82 init.php
```
输入JSON后结束stdin。安装PHP-FPM配置并启用read-local.service；安装nginx站点配置，先 `nginx -t` 再reload。不要把init.php或数据目录公开到网页入口。维护脚本安装到 `/var/lib/read-local/maintenance.php`。

健康检查在管理员侧边栏；`GET /api/health`需要管理员。匿名书架和PDF是有意公开给家庭局域网访问者的。

## 备份与维护

创建私有备份目录 `/volume1/download/read-backups`，限制为维护账户访问。两个timer示例：每月1日03:00备份、每日04:00清理，按NAS本地时区；可改用DSM任务计划（root）执行下列命令，勿重复配置两套调度：
```sh
/var/packages/PHP8.2/target/usr/local/bin/php82 /var/lib/read-local/maintenance.php backup
/var/packages/PHP8.2/target/usr/local/bin/php82 /var/lib/read-local/maintenance.php cleanup
```
cleanup末尾加 `--dry-run` 可预检。备份只有数据库与封面，**不包含PDF**。备份含密码哈希和会话，不能公开。

恢复前停用维护timer和网站服务，并保留当前数据的救援副本。检查备份SQLite integrity_check=ok，再将library.sqlite及covers恢复，旧数据库-wal/-shm文件移走，恢复http用户权限。PDF必须仍在原路径；检查书目数量、健康检查、封面、PDF及登录后再启动维护timer。DSM升级后复查服务和timer。

## 安全与许可证

仅用于可信家庭网络。HTTP不加密，管理员密码可能被同网络攻击者截获；不要开放公网。没有整本离线缓存或OCR。仓库不含账号、图书、数据库、私钥、API token或备份。

GPL-3.0-only，见LICENSE与UPSTREAM.md；仅复用Kavita部分阅读器前端逻辑，不是官方项目。保留第三方许可证。
