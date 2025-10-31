# BeatBrain

[![CI](https://github.com/apmiller108/beatbrain/actions/workflows/ci.yml/badge.svg)](https://github.com/apmiller108/beatbrain/actions/workflows/ci.yml)

## Setup
After cloning, to enable the githooks for this project run:
```bash
git config core.hooksPath .githooks
```

## Application Database

`beatbrain.sqlite`

### Dump schema

Write the current database schema as created in the application user directory by the app to `structure.sql`

```
npm run schema:dump
```
