export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import prisma from '@/lib/db/client';
import { apiError } from '@/lib/middleware/api-response';
import { logger } from '@/lib/logger';

const FORMAT_LABELS: Record<string, string> = {
  expert_panel: "Expert Panel",
  devil_advocate: "Devil's Advocate",
  socratic: "Socratic",
  red_team: "Red Team",
  consensus_build: "Consensus Building",
};

// GET - Export a debate transcript as JSON or PDF
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') ?? 'json';

    if (format !== 'json' && format !== 'pdf') {
      return apiError('INVALID_FORMAT', "Export format must be 'json' or 'pdf'", 400);
    }

    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        agents: {
          include: { scores: true },
        },
        turns: {
          orderBy: { turnNumber: 'asc' },
          include: {
            agent: { select: { name: true, role: true, agentId: true } },
            score: true,
          },
        },
        metrics: true,
      },
    });

    if (!debate) {
      return apiError('DEBATE_NOT_FOUND', 'Debate not found', 404);
    }

    const filename = `debate-${id}-export`;

    if (format === 'json') {
      return exportJson(debate, filename);
    }

    return exportPdf(debate, filename);
  } catch (error) {
    logger.error('Debate export failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError('INTERNAL_ERROR', 'Failed to export debate', 500);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportJson(debate: any, filename: string): NextResponse {
  const payload = {
    id: debate.id,
    topic: debate.topic,
    format: debate.format,
    status: debate.status,
    createdAt: debate.createdAt,
    agents: debate.agents.map((a: any) => ({
      id: a.id,
      agentId: a.agentId,
      name: a.name,
      role: a.role,
    })),
    turns: debate.turns.map((t: any) => ({
      id: t.id,
      turnNumber: t.turnNumber,
      agent: t.agent,
      content: t.content,
      tokenCount: t.tokenCount,
      score: t.score
        ? {
            composite: t.score.composite,
            cqScore: t.score.cqScore,
            aqScore: t.score.aqScore,
            cfiScore: t.score.cfiScore,
            eqScore: t.score.eqScore,
            sqScore: t.score.sqScore,
          }
        : null,
    })),
    metrics: debate.metrics
      ? {
          convergenceRate: debate.metrics.convergenceRate,
          diversityIndex: debate.metrics.diversityIndex,
          argumentationQuality: debate.metrics.argumentationQuality,
          alignmentCoherence: debate.metrics.alignmentCoherence,
          consciousnessEmergence: debate.metrics.consciousnessEmergence,
          compositeDebateScore: debate.metrics.compositeDebateScore,
        }
      : null,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}.json"`,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportPdf(debate: any, filename: string): Promise<NextResponse> {
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', resolve);
    doc.on('error', reject);

    // Title
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Debate Transcript', { align: 'center' });
    doc.moveDown(0.5);

    // Topic
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(debate.topic, { align: 'center' });
    doc.moveDown(0.3);

    // Metadata row
    const formatLabel = FORMAT_LABELS[debate.format] ?? debate.format;
    const dateStr = new Date(debate.createdAt).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#555555')
      .text(`Format: ${formatLabel}  |  Status: ${debate.status}  |  Date: ${dateStr}`, {
        align: 'center',
      });
    doc.moveDown(0.5);

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.5);

    // Score summary if metrics available
    if (debate.metrics) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('Score Summary');
      doc.moveDown(0.3);

      const m = debate.metrics;
      const metrics: [string, number][] = [
        ['Composite Debate Score', m.compositeDebateScore],
        ['Convergence Rate', m.convergenceRate],
        ['Diversity Index', m.diversityIndex],
        ['Argumentation Quality', m.argumentationQuality],
        ['Alignment Coherence', m.alignmentCoherence],
        ['Consciousness Emergence', m.consciousnessEmergence],
      ];

      for (const [label, value] of metrics) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#333333')
          .text(`${label}: ${typeof value === 'number' ? value.toFixed(1) : 'N/A'}`);
      }

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(0.5);
    }

    // Turns
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('Transcript');
    doc.moveDown(0.5);

    for (const turn of debate.turns) {
      // Turn header
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#222222')
        .text(`Turn ${turn.turnNumber} — ${turn.agent.name} (${turn.agent.role})`);

      // Score line
      if (turn.score) {
        const s = turn.score;
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#666666')
          .text(
            `Scores — Composite: ${s.composite?.toFixed(1) ?? 'N/A'}  |  ` +
              `CQ: ${s.cqScore?.toFixed(1) ?? 'N/A'}  |  ` +
              `AQ: ${s.aqScore?.toFixed(1) ?? 'N/A'}  |  ` +
              `CFI: ${s.cfiScore?.toFixed(1) ?? 'N/A'}  |  ` +
              `EQ: ${s.eqScore?.toFixed(1) ?? 'N/A'}  |  ` +
              `SQ: ${s.sqScore?.toFixed(1) ?? 'N/A'}`
          );
      }

      // Content
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#111111')
        .text(turn.content, { paragraphGap: 4 });

      doc.moveDown(0.8);
    }

    // Per-agent score summary
    if (debate.turns.length > 0) {
      const agentScores: Record<string, { name: string; role: string; scores: number[] }> = {};
      for (const turn of debate.turns) {
        const key = turn.agent.agentId;
        if (!agentScores[key]) {
          agentScores[key] = { name: turn.agent.name, role: turn.agent.role, scores: [] };
        }
        if (turn.score?.composite != null) {
          agentScores[key].scores.push(turn.score.composite);
        }
      }

      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('Agent Score Summary');
      doc.moveDown(0.3);

      for (const agent of Object.values(agentScores)) {
        const avg =
          agent.scores.length > 0
            ? (agent.scores.reduce((a, b) => a + b, 0) / agent.scores.length).toFixed(1)
            : 'N/A';
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#333333')
          .text(`${agent.name} (${agent.role}): avg composite ${avg} over ${agent.scores.length} turn(s)`);
      }
    }

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}.pdf"`,
    },
  });
}
