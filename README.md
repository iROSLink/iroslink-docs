# iROSLink Docs

MkDocs site for iROSLink. Versioned with `mike`.

## Local preview

```bash
pip install -r requirements-docs.txt
mkdocs serve
```

Open <http://127.0.0.1:8000>.

## Build (check for errors)

```bash
mkdocs build --strict
```

## Versioned preview (mike)

```bash
mike deploy dev
mike serve
```

Open <http://localhost:8000>.

## Deploy

Handled by GitHub Actions on tag push:

```bash
git tag v0.1
git push origin v0.1
```

Workflow deploys to `gh-pages` branch automatically. Enable GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch.

## Workflow file location

`.github/workflows/docs.yml` must live at the **repo root** `.github/workflows/`, not inside `iroslink-docs/`. Move it before enabling CI.
