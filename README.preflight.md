# Trae Preflight

This folder is prepared for `wangxt-752-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18052
- API_PORT: 19052
- WEB_PORT: 20052
- DB_PORT: 21052
- REDIS_PORT: 22052

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
