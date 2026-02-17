# Cost Tracking Log

## Current Balances (as of 2026-02-14 08:19 AM CT)
| Provider | Balance |
|----------|---------|
| **Moonshot (Kimi K2.5)** | $40.62 |
| **Anthropic (Opus 4.6)** | $8.59 |

## Starting Balances
- Claude: $15.00 (Feb 13)
- Kimi: ~$40.62 (current)

## Session History

### 2026-02-13
| Time | Model | Tokens In | Tokens Out | Est. Cost | Notes |
|------|-------|-----------|------------|-----------|-------|
| Evening | Opus 4.6 | ~30k | ~8k | ~$4.00 | Second Brain build attempts (failed, rate limited) |
| Evening | Kimi K2.5 | ~50k | ~15k | ~$0.10 | CRM updates, Morning Brief setup |

### 2026-02-14
| Time | Model | Tokens In | Tokens Out | Est. Cost | Notes |
|------|-------|-----------|------------|-----------|-------|
| 07:00 | Kimi K2.5 | ~15k | ~5k | ~$0.03 | Morning Brief (automated) |
| 08:10 | Opus 4.6 | ~932 | ~232 | ~$0.20 | Test response (user requested) |
| 08:11 | Kimi K2.5 | ~1,200 | ~300 | ~$0.002 | Cost tracking setup |

## Model Pricing Reference
| Model | Input / 1M | Output / 1M | Notes |
|-------|------------|-------------|-------|
| Claude Opus 4.6 | $15.00 | $75.00 | Expensive, best for complex analysis |
| Claude Sonnet 3.5 | $3.00 | $15.00 | Mid-tier |
| Claude Haiku | $0.25 | $1.25 | Fast, cheap |
| Kimi K2.5 | ~$0.60 | ~$2.00 | Very cheap, good for most tasks |

## Cost-Saving Rules
- Default to **Kimi K2.5** for routine tasks
- Use **Opus 4.6** only for:
  - Complex trading strategy analysis
  - Multi-step reasoning problems
  - Code architecture decisions
- Warn user if Opus call will exceed $0.50
