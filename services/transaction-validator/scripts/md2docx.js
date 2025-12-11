const fs = require('fs')
const path = require('path')
const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } = require('docx')

function parseMarkdown(md) {
  const lines = md.split(/\r?\n/)
  const blocks = []
  for (const line of lines) {
    const figMatch = line.match(/^\[\[FIGURA:(.+)\]\]$/)
    if (figMatch) {
      blocks.push({ type: 'figure', raw: figMatch[1].trim() })
      continue
    }
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2).trim() })
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
    } else if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
    } else if (line.startsWith('- ')) {
      blocks.push({ type: 'li', text: line.slice(2).trim() })
    } else if (line.trim() === '') {
      blocks.push({ type: 'br' })
    } else {
      blocks.push({ type: 'p', text: line.trim() })
    }
  }
  return blocks
}

function toDoc(blocks) {
  const children = []
  for (const b of blocks) {
    if (b.type === 'figure') {
      const parts = b.raw.split(' - ')
      const title = parts[0] || 'Figura'
      const desc = parts[1] || ''
      children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2 }))
      if (desc) children.push(new Paragraph({ text: desc }))
      const cellPara = [
        new Paragraph({ text: 'Inserte captura aquí' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' })
      ]
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [new TableCell({ children: cellPara })] })]
      })
      children.push(table)
      children.push(new Paragraph({ text: '' }))
      continue
    }
    if (b.type === 'h1') children.push(new Paragraph({ text: b.text, heading: HeadingLevel.TITLE }))
    else if (b.type === 'h2') children.push(new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_1 }))
    else if (b.type === 'h3') children.push(new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_2 }))
    else if (b.type === 'li') children.push(new Paragraph({ text: '• ' + b.text }))
    else if (b.type === 'br') children.push(new Paragraph({ children: [new TextRun('')] }))
    else children.push(new Paragraph({ text: b.text }))
  }
  return new Document({ sections: [{ properties: {}, children }] })
}

async function main() {
  const input = process.argv[2]
  const output = process.argv[3]
  if (!input || !output) {
    console.error('Usage: node md2docx.js <input.md> <output.docx>')
    process.exit(1)
  }
  const md = fs.readFileSync(path.resolve(input), 'utf-8')
  const blocks = parseMarkdown(md)
  const doc = toDoc(blocks)
  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(path.resolve(output), buffer)
  console.log('Wrote', output)
}

main()
