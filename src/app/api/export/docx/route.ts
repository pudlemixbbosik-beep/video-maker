import { NextRequest } from 'next/server';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import { PROJECT } from '@/lib/projectInfo';

interface Body {
  agentTitle: string;
  agentKey: string;
  content: string;
}

function parseLine(line: string): Paragraph | null {
  if (line.startsWith('#### '))
    return new Paragraph({ text: line.slice(5), heading: HeadingLevel.HEADING_4 });
  if (line.startsWith('### '))
    return new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3 });
  if (line.startsWith('## '))
    return new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 });
  if (line.startsWith('# '))
    return new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 });
  if (line.startsWith('---') || line.trim() === '')
    return new Paragraph({ text: '' });
  if (line.startsWith('| '))
    return new Paragraph({
      children: [new TextRun({ text: line, font: 'Courier New', size: 18 })],
    });
  if (line.startsWith('- ') || line.startsWith('* '))
    return new Paragraph({ text: line.slice(2), bullet: { level: 0 } });

  // strip markdown bold
  const text = line.replace(/\*\*(.*?)\*\*/g, '$1');
  return new Paragraph({ text });
}

export async function POST(req: NextRequest) {
  const { agentTitle, agentKey, content }: Body = await req.json();

  // strip SVG code blocks before exporting
  const cleaned = content.replace(/```svg[\s\S]*?```/g, '[SVG 다이어그램 — 앱에서 확인]');

  const children: Paragraph[] = [
    new Paragraph({
      text: PROJECT.name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: agentTitle,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `생성일: ${new Date().toLocaleDateString('ko-KR')}`, italics: true }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }),
  ];

  for (const line of cleaned.split('\n')) {
    const para = parseLine(line);
    if (para) children.push(para);
  }

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);
  const uint8 = new Uint8Array(buffer);

  return new Response(uint8, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${agentKey}_${Date.now()}.docx"`,
    },
  });
}
