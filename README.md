# Read · 自托管 PDF 书架

当前版本 **v1.02**。中文家庭局域网书架，Angular + PDF.js + PHP 8.2 + SQLite。无需 Docker、云服务、外部数据库或 HTTPS。不限定群晖，普通电脑、Linux 服务器和支持 PHP 的 NAS 均可配置使用；不是完整 Kavita。静态托管不能运行 PHP 后台。

## 功能与升级

免登录阅读、管理员管理、小读者账号、批量 4 MiB 分块上传（无 30 MB 应用上限）、书名封面页数识别、搜索分类和阅读进度。本版新增本地规则自动分类、上传前预览修改、现有书目批量分类整理、iPad 紧凑工具栏与专注模式。每月 SQLite 在线备份及封面备份保留最新 5 份，清理残留分块，管理员健康检查。

详细见 [CHANGELOG.md](CHANGELOG.md)。自动分类需要人工确认；实际 iPad Safari 效果需设备验证。扫描导入、哈希去重、标签、拼音搜索、家长看板尚未实现。访客进度存浏览器，账号进度存 SQLite，登录有效期 7 天。

## 构建与配置

Node.js 20+：`npm ci` 后 `npm run build`。发行 ZIP 已含构建文件，运行端不需要 Node.js。

运行需要 PHP 8.2+、PDO_SQLite、SQLite3、mbstring。仅以 public/ 为网页根目录，将 /api/* 路由至 public/api.php，保留 Authorization 头；mjs MIME 为 application/javascript，wasm 为 application/wasm。实际验证环境为 Linux/NAS，其他系统需按要求配置验证，并非所有主机开箱即用。

创建项目根目录下 books、data、data/covers、data/parts、backups，并授予网站账户写权限。这些目录和 init.php、maintenance.php 不得公开到网页根目录。自定义路径使用环境变量：READ_BOOK_ROOT、READ_DATA_DIR、READ_BACKUP_DIR，默认分别是项目根目录下 books、data、backups。

PHP-FPM 可能清空环境变量，请在池配置设置 `env[READ_DATA_DIR] = /实际/data` 等三项。维护任务使用相同配置。Windows 使用绝对路径和文件 ACL。仓库原有 nginx/FPM/service 文件是 NAS 示例，其他系统须调整 PHP 路径、用户、目录、监听地址和 socket，不能原样照搬。

首次使用网站账户运行 `php init.php`，标准输入提供 JSON（username、password）；自行选择密码，不写入仓库。只在没有管理员时创建，不重置已有管理员。

开发测试：`php -S 127.0.0.1:9080 -t public router.php`。内置服务器不适合生产并发大文件；部署用 nginx/Apache + PHP，仅监听家庭网络，防火墙禁止公网访问。

## 升级、验证与回滚

先保存旧网站及数据救援副本，停止写入。替换网页构建文件及私有维护脚本，不覆盖 PDF 或数据库。原 NAS 安装必须设置 READ_BOOK_ROOT=/volume1/download/book、READ_DATA_DIR=/var/lib/read-local、READ_BACKUP_DIR=/volume1/download/read-backups，避免使用新默认目录。

无数据库结构变更，无迁移。重启 PHP 后核对书目数量、封面、PDF、登录、上传确认、分类整理、健康检查及 iPad 横竖屏阅读。回滚时停止服务，恢复旧代码及运行配置后启动；保留当前数据库即可。

## 维护与恢复

系统任务计划每月执行 `php /项目路径/maintenance.php backup`，每日执行 `php /项目路径/maintenance.php cleanup`；任务携带相同环境变量和写权限。cron 时间可用 `0 3 1 * *` 和 `0 4 * * *`，不要重复调度。cleanup 支持 --dry-run。备份只有数据库及封面，不含 PDF；新备份校验成功后保留最新 5 份，限制备份访问权限。

恢复时停用网站写入及维护任务，保存当前数据；检查备份 SQLite 的 PRAGMA integrity_check 返回 ok，恢复 library.sqlite 和 covers，移走旧 -wal/-shm 文件，恢复文件权限。PDF 原文件必须仍存在。启动后检查书目数量、健康检查、封面、PDF和登录，再启用维护任务。重启机器后的自动访问依赖 Web/PHP 服务自启动设置。

## 安全与许可证

仅可信家庭网络使用，HTTP 不加密；免登录意味着同网络用户可看书。管理权限由 PHP 后台检查。不开放公网。发行包无私人图书、数据库、密码、token、证书或备份。

GPL-3.0-only，见 LICENSE、UPSTREAM.md。保留 Kavita 改编代码及第三方许可证，不是 Kavita 官方项目。完整源码随发行包附带。
