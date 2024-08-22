import path from 'pathe'

export async function loadText(file: string, isSplit: true): Promise<string[] | undefined>
export async function loadText(file: string, isSplit?: false): Promise<string | undefined>

export async function loadText(file: string, isSplit = false) {
  try {
    const res = await fetch(file)
    if (res.status !== 200) throw new Error()
    const text = await res.text()
    return isSplit ? text.split(text.includes('\r\n') ? '\r\n' : '\n') : text
  } catch (e) {
    return undefined
  }
}

export async function loadScript(script: string) {
  const lines = await loadText(script, true)
  return lines?.filter((line) => line.trim() && !line.trim().startsWith('#'))
}

export async function loadScriptPart(script: string, type: 'msg' | 'voice' = 'msg') {
  const file = path.join(path.parse(script).dir, `${path.parse(script).name}${type === 'voice' ? `.${type}` : ''}.txt`)
  const lines = await loadText(file, true)
  if (!lines) return undefined

  const result: string[][] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line !== '') {
      const paragraph: string[] = []
      paragraph.push(line)
      while (i + 1 < lines.length && lines[i + 1].trim() !== '') {
        i++
        paragraph.push(lines[i].trim())
      }
      result.push(paragraph)
    }
  }

  return result.filter((paragraph) => paragraph.length > 0)
}
