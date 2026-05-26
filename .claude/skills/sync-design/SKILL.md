---
description: Sync design system tokens from a Claude Design bundle URL. Updates css-variables.css, tokens.ts, and antd-theme.ts to match the latest design. Use when the user pastes a Claude Design URL or says the design was updated.
argument-hint: "[claude-design-url]"
model: claude-haiku-4-5-20251001
disable-model-invocation: true
allowed-tools: Bash Read Edit
context: fork
---

Sync the TradeMaster design system from a Claude Design bundle.

## 1. Run the sync script

If `$ARGUMENTS` contains a URL, run:
```
npm run sync-design -- --url="$ARGUMENTS"
```
Otherwise run:
```
npm run sync-design
```

Read the output. It will show:
- `~ Changed` — token values that changed (e.g. color, radius)
- `+ Added` — new tokens
- `- Removed` — removed tokens
- "already up to date" — nothing to do, stop here

## 2. Update tokens.ts if values changed

If there are any `~ Changed` lines, read `src/design-system/tokens.ts` and update the matching values.

Mapping from CSS variable name to tokens.ts key:
- `--ant-primary` → `color.primary`
- `--ant-primary-hover` → `color.primaryHover`
- `--ant-primary-active` → `color.primaryActive`
- `--ant-primary-bg` → `color.primaryBg`
- `--ant-primary-border` → `color.primaryBorder`
- `--ant-success` → `color.success`
- `--ant-warning` → `color.warning`
- `--ant-error` → `color.error`
- `--ant-purple` → `color.purple`
- `--ant-cyan` → `color.cyan`
- `--ant-orange` → `color.orange`
- `--ant-sider-bg-active` → `sider.bgActive`
- `--ant-radius` → `radius.base` (strip "px", use number)
- `--ant-radius-sm` → `radius.sm`
- `--ant-radius-xs` → `radius.xs`

## 3. Verify build passes

```
npm run build
```

If build fails, report the error and stop.

## 4. Commit

```
git add src/design-system/ && git commit -m "Sync design system from Claude Design bundle"
```

## 5. Report

Print a short summary:
- How many tokens changed / added / removed
- Which values changed (old → new)
- Whether build passed
