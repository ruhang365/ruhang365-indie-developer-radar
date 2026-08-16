# 数据来源与授权边界

## 上游来源

- 来源仓库：[`1c7/chinese-independent-developer`](https://github.com/1c7/chinese-independent-developer)
- 上游维护者：1c7 及其贡献者
- 上游用途：中国独立开发者项目列表
- 截至本项目建立时，上游仓库未声明许可证。

## 机会模式参考

- 分类参考：[`bleedline/aimoneyhunter`](https://github.com/bleedline/aimoneyhunter)
- 参考范围：AI 内容、视频、图片、文案、音频和技术服务等机会分类。
- 转化方式：不把参考条目写入项目候选；由入行365重新定义目标用户、工作节点、交付物、首批用户路径、证据要求和七天继续/停止条件。

## 本项目保存什么

本项目只保存项目名称、公开链接、开发者名称、状态、首次出现日期、来源文件、来源提交 SHA、行指纹，以及入行365自行生成的分类、标签、风险提示和变化统计。

本项目不复制、再发布上游的整份 README，也不保存上游项目介绍原文。

`data/opportunity-patterns.json` 是独立维护的机会假设层；`data/candidates.json` 仍只保存真实项目候选。两者通过 `candidate_filter` 连接，不共享对象身份或验证状态。

`data/opportunity-cases.json` 把外部标题或方向转成入行365原创案例合同。外部来源只证明该方向曾被提出；案例的用户、流程、交付、验收、证据与停止条件由入行365重新设计，在取得真实试点证据前统一标记为 `hypothesis` 与 `source_lead_only`。

## MIT License 覆盖范围

本仓库的 MIT License 仅覆盖入行365原创的：

- 同步与解析代码；
- 数据 Schema；
- 分类与风险规则；
- 变化报告结构；
- 机会验证卡模板；
- 文档和测试。

上游项目名称、链接、开发者信息及第三方商标仍归各自权利人所有；上游清单的数据库或汇编权利不因本仓库的 MIT License 而改变。

## 使用要求

- 使用候选数据时保留 `source_repo`、`source_url` 和 `source_sha`。
- 发布项目信息前打开项目原始链接复核，不把候选状态当成质量背书。
- 不把“被原列表收录”表述成入行365推荐、投资建议或商业保证。
