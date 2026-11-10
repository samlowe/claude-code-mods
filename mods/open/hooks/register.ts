import type { Register } from 'claude-code'

// Platform openers, tried in order until one starts and exits 0.
const OPENERS: readonly string[] = ['xdg-open', 'open', 'wslview']

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'open',
      description:
        "Write Claude's last response to a temp .md file and open it in the default app",
    })

    return next(e)
  })

  on('command.run', { command: 'open' }, async $ => {
    // Same source as /copy: the latest assistant message that has text.
    const messages = await $.session.messages()
    if ('deny' in messages) return { text: 'Cannot read the transcript.' }
    const last = [...messages]
      .reverse()
      .find(m => m.role === 'assistant' && m.text.trim() !== '')
    if (last === undefined) return { text: 'No assistant response to open.' }

    const file = `/tmp/claude-response-${Date.now()}.md`
    await $.fs.write(file, last.text)

    for (const opener of OPENERS) {
      try {
        const ran = await $.process.run([opener, file], { timeoutMs: 5000 })
        if (ran.exitCode === 0) return { text: `Opened ${file}` }
      } catch {
        // opener not installed; try the next
      }
    }

    return { text: `Wrote ${file}, but found no app to open it with.` }
  })
}
