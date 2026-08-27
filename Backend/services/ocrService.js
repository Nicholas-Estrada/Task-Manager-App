const fs = require('fs');
const pdf = require('pdf-parse');

// Google Vision client (cloud OCR)
let visionClient;
try {
  const vision = require('@google-cloud/vision');
  visionClient = new vision.ImageAnnotatorClient();
} catch (err) {
  console.warn('Google Vision client not available. Install @google-cloud/vision and set GOOGLE_APPLICATION_CREDENTIALS to use cloud OCR. Falling back to pdf text extraction where possible.');
}

function bboxFromVertices(vertices) {
  if (!vertices || vertices.length === 0) return null;
  const xs = vertices.map(v => v.x || 0);
  const ys = vertices.map(v => v.y || 0);
  return { xMin: Math.min(...xs), xMax: Math.max(...xs), yMin: Math.min(...ys), yMax: Math.max(...ys) };
}

async function parseVisionFullTextAnnotation(result) {
  const pages = (result && result.fullTextAnnotation && result.fullTextAnnotation.pages) || [];
  const blocks = [];
  pages.forEach((page, pageIndex) => {
    (page.blocks || []).forEach(block => {
      const blockText = [];
      (block.paragraphs || []).forEach(par => {
        (par.words || []).forEach(word => {
          const symbols = (word.symbols || []).map(s => s.text).join('');
          blockText.push(symbols);
        });
      });
      const text = blockText.join(' ');
      const bbox = bboxFromVertices(block.boundingBox && block.boundingBox.vertices);
      blocks.push({ text: text.trim(), bbox, page: pageIndex + 1 });
    });
  });
  // Fallback to fullTextAnnotation.text if no blocks
  if (blocks.length === 0 && result && result.fullTextAnnotation && result.fullTextAnnotation.text) {
    const lines = result.fullTextAnnotation.text.split(/\r?\n/);
    return lines.map((t, i) => ({ text: t, page: 1 }));
  }
  return blocks;
}

async function extractTextFromPDF(filePath) {
  const data = fs.readFileSync(filePath);
  const pdfData = await pdf(data);

  if (pdfData && pdfData.text && pdfData.text.trim().length > 0) {
    // PDF has selectable text — return lines as blocks (page unknown)
    return pdfData.text.split(/\r?\n/).map(t => ({ text: t, page: 1 }));
  }

  // No selectable text — try cloud OCR (if available) on the PDF file
  if (visionClient) {
    try {
      // For a prototype, attempt documentTextDetection on the PDF path. For robust multi-page PDFs
      // it's recommended to use async batchAnnotateFiles with a GCS input file and output. This attempt
      // will work for many single-page or image-PDF use cases.
      const [result] = await visionClient.documentTextDetection(filePath);
      const blocks = await parseVisionFullTextAnnotation(result);
      return blocks;
    } catch (err) {
      console.warn('Google Vision documentTextDetection failed on PDF (async GCS recommended):', err.message);
      return [];
    }
  }

  return [];
}

async function extractTextFromImage(filePath) {
  if (!visionClient) {
    // No vision client — try nothing for images
    return [];
  }
  try {
    const [result] = await visionClient.documentTextDetection(filePath);
    const blocks = await parseVisionFullTextAnnotation(result);
    return blocks;
  } catch (err) {
    console.warn('Google Vision documentTextDetection failed on image:', err.message);
    return [];
  }
}

module.exports = {
  extractTextFromPDF,
  extractTextFromImage,
};
