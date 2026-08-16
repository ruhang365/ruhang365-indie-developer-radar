# 贡献指南

这个仓库不直接接收“请把我的产品加入上游列表”的请求。项目收录请前往原始仓库：

<https://github.com/1c7/chinese-independent-developer>

这里欢迎提交：

- 解析错误修复；
- 新的原创分类规则；
- 风险识别规则；
- 机会验证卡模板；
- 数据质量测试；
- 面向具体行业或场景的原创分析。

新增 AI 机会模式时，请修改 `data/opportunity-patterns.json`，并确保：

- 目标用户和工作节点具体；
- 有真实可验收的交付物；
- 写明找到首批用户的方法；
- 七天验证同时包含动作、证据、继续条件和停止条件；
- 使用 `candidate_filter` 连接现有项目候选，不把机会模式混入 `candidates.json`；
- 运行 `npm test && npm run opportunities:validate`。

新增 AI 机会案例时，请修改 `data/opportunity-cases.json`，并确保案例归属一个现有机会模式，包含真实输入、工作步骤、交付物、验收标准、首次客户路径和七天验证合同。外部文章或标题只能作为 `source_lead_only`，不能据此标记为 `validated`；验证状态必须由真实使用证据和最近核验时间支持。

Pull Request 不得复制上游大段项目介绍，也不得提交密钥、Cookie、个人隐私或未经授权的付费数据。
