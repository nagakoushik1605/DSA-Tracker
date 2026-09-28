export type ExcelProblemRow = {
  number: string
  title: string
  concept: string
  difficulty: string
  importance: string
  url: string
  xp: string
  published: string
  tags: string
}

type ZipEntry = { name: string; method: number; compressedSize: number; localOffset: number }

const textDecoder = new TextDecoder('utf-8')

function u16(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8)
}
function u32(bytes: Uint8Array, offset: number) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0
}

function findEndOfCentralDirectory(bytes: Uint8Array) {
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (u32(bytes, i) === 0x06054b50) return i
  }
  throw new Error('Invalid Excel file: ZIP directory was not found.')
}

function readCentralDirectory(bytes: Uint8Array): ZipEntry[] {
  const eocd = findEndOfCentralDirectory(bytes)
  const count = u16(bytes, eocd + 10)
  const offset = u32(bytes, eocd + 16)
  const entries: ZipEntry[] = []
  let p = offset

  for (let i = 0; i < count; i++) {
    if (u32(bytes, p) !== 0x02014b50) throw new Error('Invalid Excel file: ZIP entry is corrupted.')
    const method = u16(bytes, p + 10)
    const compressedSize = u32(bytes, p + 20)
    const nameLength = u16(bytes, p + 28)
    const extraLength = u16(bytes, p + 30)
    const commentLength = u16(bytes, p + 32)
    const localOffset = u32(bytes, p + 42)
    const name = textDecoder.decode(bytes.slice(p + 46, p + 46 + nameLength))
    entries.push({ name, method, compressedSize, localOffset })
    p += 46 + nameLength + extraLength + commentLength
  }
  return entries
}

async function readZipEntry(bytes: Uint8Array, entry: ZipEntry): Promise<string> {
  const p = entry.localOffset
  if (u32(bytes, p) !== 0x04034b50) throw new Error(`Invalid Excel file: ${entry.name}`)
  const nameLength = u16(bytes, p + 26)
  const extraLength = u16(bytes, p + 28)
  const start = p + 30 + nameLength + extraLength
  const compressed = bytes.slice(start, start + entry.compressedSize)

  let result: Uint8Array
  if (entry.method === 0) {
    result = compressed
  } else if (entry.method === 8) {
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    result = new Uint8Array(await new Response(stream).arrayBuffer())
  } else {
    throw new Error(`Unsupported Excel compression method for ${entry.name}.`)
  }
  return textDecoder.decode(result)
}

function cellColumn(ref: string) {
  const letters = ref.match(/^[A-Z]+/i)?.[0] ?? ''
  let n = 0
  for (const ch of letters.toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64
  return n - 1
}

function clean(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function xmlText(el: Element) {
  return clean(Array.from(el.getElementsByTagName('t')).filter(t => t.parentElement?.localName !== 'rPh').map(t => t.textContent ?? '').join(''))
}

function parseSharedStrings(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  return Array.from(doc.getElementsByTagName('si')).map(xmlText)
}

function parseSheet(xml: string, shared: string[]) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const rows: string[][] = []
  for (const row of Array.from(doc.getElementsByTagName('row'))) {
    const cells: string[] = []
    for (const cell of Array.from(row.getElementsByTagName('c'))) {
      const ref = cell.getAttribute('r') ?? ''
      const index = cellColumn(ref)
      let value = ''

      const type = cell.getAttribute('t')
      if (type === 'inlineStr') {
        value = xmlText(cell)
      } else {
        const v = cell.getElementsByTagName('v')[0]?.textContent ?? ''
        if (type === 's') value = shared[Number(v)] ?? ''
        else value = v
      }
      cells[index] = clean(value)
    }
    rows.push(cells)
  }
  return rows
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function get(row: string[], map: Record<string, number>, ...names: string[]) {
  for (const name of names) {
    const i = map[normalizeHeader(name)]
    if (i !== undefined) return clean(row[i])
  }
  return ''
}

export async function readExcelProblems(file: File): Promise<ExcelProblemRow[]> {
  if (!/\.xlsx$/i.test(file.name)) {
    throw new Error('Please use an .xlsx Excel file. The browser uploader supports modern Excel workbooks.')
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const entries = readCentralDirectory(bytes)
  const byName = new Map(entries.map(e => [e.name, e]))

  const shared = byName.has('xl/sharedStrings.xml')
    ? parseSharedStrings(await readZipEntry(bytes, byName.get('xl/sharedStrings.xml')!))
    : []

  let sheetEntry = byName.get('xl/worksheets/sheet1.xml')
  if (!sheetEntry) {
    sheetEntry = entries.filter(e => /^xl\/worksheets\/[^/]+\.xml$/i.test(e.name)).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))[0]
  }
  if (!sheetEntry) throw new Error('The Excel workbook must contain a worksheet.')

  const rows = parseSheet(await readZipEntry(bytes, sheetEntry), shared)
  if (!rows.length) return []

  const header = rows[0]
  const map: Record<string, number> = {}
  header.forEach((value, index) => { map[normalizeHeader(value)] = index })

  const titleIndex = map.title
  const conceptIndex = map.concept
  const difficultyIndex = map.difficulty
  if (titleIndex === undefined || conceptIndex === undefined || difficultyIndex === undefined) {
    throw new Error('Excel must contain these columns: Title, Concept, Difficulty.')
  }

  return rows.slice(1)
    .filter(row => row.some(Boolean))
    .map(row => ({
      number: get(row, map, 'Number', 'Problem Number', 'ProblemNumber'),
      title: get(row, map, 'Title', 'Problem', 'Problem Title', 'ProblemTitle'),
      concept: get(row, map, 'Concept'),
      difficulty: get(row, map, 'Difficulty'),
      importance: get(row, map, 'Importance'),
      url: get(row, map, 'URL', 'Link', 'LeetCode URL', 'LeetCodeURL'),
      xp: get(row, map, 'XP'),
      published: get(row, map, 'Published'),
      tags: get(row, map, 'Tags'),
    }))
}
