# claude-code-mods

Mods for Claude Code.

## Install

At the prompt of a Claude Code session:

```
/plugin install open --marketplace samlowe/claude-code-mods
```

Or from a shell:

```
claude plugin install open --marketplace samlowe/claude-code-mods
```

Or from a local checkout:

```
claude plugin marketplace add /path/to/claude-code-mods
claude plugin install open@claude-code-mods
```

## Mods

### `/open [@file]`

Opens something in your default app (`xdg-open`, falling back to `open` /
`wslview`): a given file, or Claude's last response if none is given.

With no argument it works like `/copy`, but instead of putting the last response
on the clipboard it writes it to `/tmp/claude-response-<timestamp>.md` and opens
that.

The optional `file` argument is opened directly instead. A leading `@` (from
file autocomplete) is ignored, and relative paths resolve against the session's
directory.

Only data and content files are opened: text and data (`md`, `txt`, `csv`,
`json`, `yaml`, ...), documents (`pdf`, `docx`, `odt`, `epub`, ...),
spreadsheets and slides (`xlsx`, `pptx`, ...), images, audio and video. Scripts,
executables, archives, and `html`/`svg` (which run script when rendered) are
refused. The list lives in `OPENABLE` in `mods/open/hooks/register.ts`.

## License

[MIT](LICENSE)
