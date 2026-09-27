# Testing

Run the browser-engine syntax and method-presence check from the repository root:

```bash
node scripts/check_stats_js.mjs
```

Numerical reference regression tests against R remain the next validation step. The syntax check deliberately parses the browser bundle without executing DOM-dependent initialization.