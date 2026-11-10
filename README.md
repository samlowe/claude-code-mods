# claude-code-mods

Mods for Claude Code.

## Install

```
/plugin install open --marketplace <owner>/<repo>
```

Or from a local checkout:

```
claude plugin marketplace add /path/to/claude-code-mods
claude plugin install open@claude-code-mods
```

## Mods

- **`/open`**: like `/copy`, but instead of copying the last response to the
  clipboard it writes it to `/tmp/claude-response-<timestamp>.md` and opens it
  in the default app for markdown files (`xdg-open`, falling back to `open` / `wslview`).
