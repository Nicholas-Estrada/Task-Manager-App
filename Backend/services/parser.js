const chrono = require('chrono-node');

function classifyAssignmentType(text) {
  if (!text) return 'assessment';
  const t = text.toLowerCase();
  if (/\bquiz\b/.test(t)) return 'quiz';
  if (/\b(pop quiz)\b/.test(t)) return 'quiz';
  if (/\b(midterm|final|exam|test)\b/.test(t)) return 'test';
  if (/\b(hw|homework|assignment|assign)\b/.test(t)) return 'homework';
  if (/\blab\b/.test(t)) return 'lab';
  if (/\bproject\b/.test(t)) return 'project';
  return 'assessment';
}

function extractTitleFromLine(line, type) {
  if (!line) return '';
  // Heuristic: remove date/time phrases from end of the line
  // and common labels like "Due:" or "Due".
  let s = line.replace(/\b(due[:]?|due)\b[:]?/i, '');
  // remove time/date ranges parsed by chrono (best-effort)
  s = s.replace(/\b\d{1,2}[:]?\d{0,2}\s*(AM|PM|am|pm)?\b/g, '');
  s = s.replace(/\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/g, '');
  s = s.replace(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(?:,?\s*\d{4})?/ig, '');
  s = s.replace(/\s{2,}/g, ' ');
  return s.trim();
}

function computeConfidence(line, parsed) {
  let score = 0.5; // base
  if (parsed && parsed.length) score += 0.3;
  if (line && /\b(quiz|test|midterm|final|homework|due|assignment)\b/i.test(line)) score += 0.15;
  return Math.min(1, score);
}

function extractEventsFromBlocks(blocks) {
  const results = [];
  if (!blocks || !Array.isArray(blocks)) return results;

  for (const b of blocks) {
    const text = (b && b.text) ? b.text.trim() : '';
    if (!text) continue;

    // Parse for dates/times
    const parsed = chrono.parse(text);
    if (parsed && parsed.length) {
      for (const p of parsed) {
        const start = p.start ? p.start.date() : null;
        const end = p.end ? p.end.date() : null;

        const title = extractTitleFromLine(text);
        const type = classifyAssignmentType(text);

        results.push({
          title: title || text.substring(0, 80),
          type,
          date: start ? start.toISOString().slice(0,10) : null,
          start_time: start ? start.toISOString().slice(11,16) : null,
          end_time: end ? end.toISOString().slice(11,16) : null,
          source_text: text,
          confidence: computeConfidence(text, parsed),
        });
      }
    } else {
      // If no explicit date, but line contains keywords like "Due" and a nearby line may have a date.
      // For this simple prototype, still classify these as potential items without dates.
      if (/\b(due|due date|deadline|homework|assignment|quiz|test)\b/i.test(text)) {
        const type = classifyAssignmentType(text);
        results.push({
          title: extractTitleFromLine(text) || text.substring(0,80),
          type,
          date: null,
          start_time: null,
          end_time: null,
          source_text: text,
          confidence: 0.45,
        });
      }
    }
  }

  return results;
}

module.exports = { extractEventsFromBlocks, classifyAssignmentType, extractTitleFromLine };
