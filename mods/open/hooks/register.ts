import type { Register } from 'claude-code'

// Platform openers, tried in order until one starts and exits 0.
const OPENERS: readonly string[] = ['xdg-open', 'open', 'wslview']

// File types `/open <file>` will open: data and content only. Deliberately
// absent: anything executable or scripted (sh, py, js, exe, app, desktop, ...),
// archives (their contents may be executable), and html/svg (they run script
// when rendered).
const OPENABLE: ReadonlySet<string> = new Set([
  // text and data
  'md', 'markdown', 'txt', 'text', 'log', 'csv', 'tsv', 'json', 'yaml', 'yml',
  'toml', 'xml',
  // documents
  'pdf', 'rtf', 'odt', 'doc', 'docx', 'pages', 'epub',
  // spreadsheets and slides
  'xls', 'xlsx', 'ods', 'ppt', 'pptx', 'odp', 'key',
  // images
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'heic',
  // audio and video
  'mp3', 'm4a', 'wav', 'flac', 'ogg', 'opus', 'aac', 'mp4', 'm4v', 'mov', 'mkv',
  'webm', 'avi',
])

// The lower-cased extension of a path, or undefined if it has none.
const extensionOf = (path: string): string | undefined =>
  path.match(/\.([^./]+)$/)?.[1]?.toLowerCase()

const unquote = (s: string): string =>
  /^(["']).*\1$/.test(s) ? s.slice(1, -1).trim() : s

// Turns what the person typed after `/open` into a path: drops surrounding
// quotes and the `@` the file autocomplete puts in front.
const cleanPath = (args: string): string => {
  let path = unquote(args.trim())
  if (path.startsWith('@')) path = unquote(path.slice(1).trim())
  return path
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'open',
      description:
        "Open Claude's last response, or a given file, in the default app",
      argumentHint: '[@file]',
    })

    return next(e)
  })

  on('command.run', { command: 'open' }, async ($, e) => {
    const open = async (file: string): Promise<string> => {
      for (const opener of OPENERS) {
        try {
          const ran = await $.process.run([opener, file], { timeoutMs: 5000 })
          if (ran.exitCode === 0) return `Opened ${file}`
        } catch {
          // opener not installed; try the next
        }
      }
      return `Found no app to open ${file} with.`
    }

    const requested = cleanPath(e.args)

    if (requested !== '') {
      const ext = extensionOf(requested)
      if (ext === undefined || !OPENABLE.has(ext)) {
        return { text: `Not a file type /open can open: ${requested}` }
      }
      let path = requested
      if (path === '~' || path.startsWith('~/')) {
        const home = await $.env.get('HOME')
        if (home !== undefined) path = home + path.slice(1)
      }
      if (!path.startsWith('/')) path = `${await $.session.cwd()}/${path}`
      if (!(await $.fs.exists(path))) return { text: `File not found: ${path}` }

      return { text: await open(path) }
    }

    // Same source as /copy: the latest assistant message that has text.
    const messages = await $.session.messages()
    if ('deny' in messages) return { text: 'Cannot read the transcript.' }
    const last = [...messages]
      .reverse()
      .find(m => m.role === 'assistant' && m.text.trim() !== '')
    if (last === undefined) return { text: 'No assistant response to open.' }

    const file = `/tmp/claude-response-${Date.now()}.md`
    await $.fs.write(file, last.text)

    return { text: await open(file) }
  })
}
