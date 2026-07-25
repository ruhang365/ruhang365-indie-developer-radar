# 入行365 · 中国独立开发机会雷达

把公开项目名单从“看别人做了什么”，变成“我下一步该验证什么”。

这个项目持续跟踪 [`1c7/chinese-independent-developer`](https://github.com/1c7/chinese-independent-developer) 的公开变化，但不复制上游整份介绍。它只保存可核验事实，并增加入行365原创的分类、风险提示、变化追踪和机会验证方法。

## 你可以直接使用的资产

- [结构化候选数据](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/data/candidates.json)：项目名称、链接、状态、开发者、来源位置、分类、标签和风险提示。
- [候选数据 Schema](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/data/candidate.schema.json)：供其他工具稳定读取和校验字段。
- [来源状态](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/data/source-state.json)：当前同步到的上游提交 SHA 和文件范围。
- [最新变化报告](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/reports/latest.json)：新增、移除、状态变化和品类统计。
- [独立开发机会验证卡](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/docs/opportunity-validation-card.md)：把一个项目转成七天需求验证任务。
- [数据来源与授权边界](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/DATA_PROVENANCE.md)：明确哪些是上游事实，哪些是入行365原创资产。

## 这不是另一个项目榜单

原始名单适合发现项目，这个仓库负责补四层能力：

1. **可同步**：每天检查上游提交，记录来源 SHA。
2. **可计算**：把项目状态、来源位置和分类转成 JSON。
3. **可判断**：标记敏感密钥、金融、健康和成人内容等需要额外复核的场景。
4. **可行动**：用机会验证卡把“想抄一个功能”改成“验证一个用户问题”。

## 三步开始

```bash
git clone https://github.com/ruhang365/ruhang365-indie-developer-radar.git
cd ruhang365-indie-developer-radar
npm test && npm run sync
```

同步完成后：

1. 在 `data/candidates.json` 按 `category` 选一个你熟悉的方向；
2. 打开候选项的 `url` 和 `source_url`，核对产品与来源；
3. 复制[机会验证卡](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/docs/opportunity-validation-card.md)，在七天内完成 5 次真实访谈。

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

## 自动更新

GitHub Action 每天执行：

1. 运行解析测试；
2. 获取上游最新提交和三个公开列表；
3. 生成候选数据、来源状态和变化报告；
4. 只有数据变化时才提交。

## 授权

同步代码、Schema、分类规则、报告结构、文档和机会验证卡采用 MIT License。

上游仓库未声明许可证，因此上游清单及第三方项目资料不包含在本项目的 MIT 授权中。完整边界见 [DATA_PROVENANCE.md](https://github.com/ruhang365/ruhang365-indie-developer-radar/blob/main/DATA_PROVENANCE.md)。
