# 入行365 · 中国独立开发机会雷达

把公开项目名单和 AI 机会分类从“看别人做了什么”，变成“我下一步该验证什么”。

这个项目包含两个互不混淆的数据层：`candidates` 保存真实项目候选，`opportunity patterns` 保存入行365重新设计的机会验证路径。项目持续跟踪 [`1c7/chinese-independent-developer`](https://github.com/1c7/chinese-independent-developer) 的公开变化，并参考 [`bleedline/aimoneyhunter`](https://github.com/bleedline/aimoneyhunter) 的 AI 机会分类重新设计首批七条机会模式。

## 你可以直接使用的资产

- [结构化候选数据](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/data/candidates.json)：项目名称、链接、状态、开发者、来源位置、分类、标签和风险提示。
- [候选数据 Schema](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/data/candidate.schema.json)：供其他工具稳定读取和校验字段。
- [AI 机会模式](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/data/opportunity-patterns.json)：七条可执行机会路径，包含用户、工作节点、交付物、首批用户入口和七天验证标准。
- [机会模式 Schema](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/data/opportunity-pattern.schema.json)：锁定机会模式的输入、交付、证据和继续/停止契约。
- [来源状态](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/data/source-state.json)：当前同步到的上游提交 SHA 和文件范围。
- [最新变化报告](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/reports/latest.json)：新增、移除、状态变化和品类统计。
- [独立开发机会验证卡](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/docs/opportunity-validation-card.md)：把一个项目转成七天需求验证任务。
- [数据来源与授权边界](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/DATA_PROVENANCE.md)：明确哪些是上游事实，哪些是入行365原创资产。

## 这不是另一个项目榜单

原始名单和机会合集适合发现线索，这个仓库负责补五层能力：

1. **可同步**：每天检查上游提交，记录来源 SHA。
2. **可计算**：把项目状态、来源位置和分类转成 JSON。
3. **可判断**：标记敏感密钥、金融、健康和成人内容等需要额外复核的场景。
4. **可匹配**：先按自己的用户、能力和工作节点选择机会模式，再查看相关真实项目。
5. **可行动**：用机会验证卡把“想抄一个功能”或“收藏一个副业”改成“验证一个用户问题”。

## 三步开始

```bash
git clone https://github.com/ruhang365/ruhang365-indie-developer-radar.git
cd ruhang365-indie-developer-radar
npm test && npm run opportunities:validate && npm run sync
```

需要在上游 SHA 未变化时重建分类数据，可执行 `npm run sync:force`。

同步完成后：

1. 在 `data/opportunity-patterns.json` 选择一个你熟悉、能接触真实用户的机会模式；
2. 使用其中的 `candidate_filter` 到 `data/candidates.json` 查看相关真实项目并核对现状；
3. 复制[机会验证卡](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/docs/opportunity-validation-card.md)，在七天内完成 5 次真实访谈和 1 次最小交付。

## 数据结构

每条候选只保留事实和原创衍生字段：

```json
{
  "name": "项目名称",
  "url": "项目公开链接",
  "status": "live",
  "developer_name": "开发者",
  "source_file": "README.md",
  "source_line": 42,
  "source_sha": "上游提交 SHA",
  "category": "productivity",
  "capability_tags": ["productivity"],
  "risk_flags": [],
  "review_status": "candidate"
}
```

`candidate` 只表示它被数据源发现，不代表入行365推荐、质量认证或投资判断。

机会模式与项目候选分开保存：

```json
{
  "id": "ai-content-operations-service",
  "title": "AI 内容运营服务",
  "track": "ai-content-operations",
  "target_users": ["没有专职内容运营的本地商家"],
  "deliverable": "一周选题表、三条可审核内容草稿和一张发布后复盘表",
  "candidate_filter": {
    "categories": ["ai-content", "creator-tools", "commerce"],
    "keywords": ["内容", "选题", "营销"]
  },
  "status": "hypothesis"
}
```

`hypothesis` 表示这是一条等待真实用户验证的机会路径，不代表收益预测或商业保证。

## 自动更新

GitHub Action 由统一调度按周执行：

1. 运行解析测试；
2. 获取上游最新提交和三个公开列表；
3. 生成候选数据、来源状态和变化报告；
4. 验证手工维护的 AI 机会模式；
5. 只有同步数据发生变化时才提交。

## 授权

同步代码、Schema、分类规则、报告结构、文档和机会验证卡采用 MIT License。

上游仓库未声明许可证，因此上游清单及第三方项目资料不包含在本项目的 MIT 授权中。完整边界见 [DATA_PROVENANCE.md](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/DATA_PROVENANCE.md)。
