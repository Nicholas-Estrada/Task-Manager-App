const fs = require('fs');
const path = require('path');
const ocrService = require('../services/ocrService');
const parser = require('../services/parser');

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = path.resolve(req.file.path);
    const ext = path.extname(req.file.originalname).toLowerCase();

    let blocks = [];
    if (ext === '.pdf') {
      blocks = await ocrService.extractTextFromPDF(filePath);
    } else {
      blocks = await ocrService.extractTextFromImage(filePath);
    }

    if (blocks.length === 0) {
      return res.status(422).json({
        error: 'No readable text was found in this file.',
        details: 'This appears to be a scanned PDF/image. Configure Google Cloud Vision credentials, then restart the backend.',
        code: 'OCR_REQUIRED'
      });
    }

    const events = parser.extractEventsFromBlocks(blocks);

    // Attempt best-effort cleanup of uploaded file
    fs.unlink(filePath, () => {});

    return res.json({ events });
  } catch (err) {
    console.error('Import upload error:', err);
    return res.status(500).json({ error: 'Processing error', details: err.message });
  }
};
