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

### `/open [@file.md]`

Opens markdown in your default app for `.md` files (`xdg-open`, falling back to
`open` / `wslview`): a given markdown file, or Claude's last response if none is
given.

With no argument it works like `/copy`, but instead of putting the last response
on the clipboard it writes it to `/tmp/claude-response-<timestamp>.md` and opens
that.

The optional `file.md` argument is opened directly instead. A leading `@` (from
file autocomplete) is ignored, and relative paths resolve against the session's
directory.

## License

[MIT](LICENSE)
