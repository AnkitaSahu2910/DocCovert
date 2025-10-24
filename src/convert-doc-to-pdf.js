// convert-doc-to-pdf.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs/promises');

/**
 * Converts a document (doc, docx, odt, etc.) to PDF using LibreOffice.
 * @param {string} inputPath - Absolute or relative path to the input file.
 * @param {string} outputDir - Directory to save the resulting PDF.
 * @returns {Promise<string>} - Resolves with the path to the generated PDF.
 */
const SUPPORTED_FORMATS = new Set(["docx", "doc", "odt", "rtf", "ppt", "pptx"]);
async function convertToPDF(inputPath, outputDir = path.dirname(inputPath)) {
  // Validate input file
  try {
    await fs.access(inputPath);
  } catch {
    throw new Error(`Input file not found: ${inputPath}`);
  }
  const ext = path.extname(inputPath).toLowerCase().slice(1);
  if (!SUPPORTED_FORMATS.has(ext)) {
    throw new Error(`Unsupported input format: .${ext}`);
  }

  const absoluteInput = path.resolve(inputPath);
  const absoluteOutputDir = path.resolve(outputDir);

  console.log(`[Converter] Starting conversion: ${absoluteInput}`);

  // Run LibreOffice in headless mode (no GUI)
  const command = `soffice --headless --convert-to pdf --outdir "${absoluteOutputDir}" "${absoluteInput}"`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Converter Error] ${stderr}`);
        reject(new Error(`Conversion failed: ${error.message}`));
        return;
      }

      const outputFile = path.join(
        absoluteOutputDir,
        `${path.basename(inputPath, path.extname(inputPath))}.pdf`
      );

      console.log(`[Converter] Conversion complete! -> ${outputFile}`);
      resolve(outputFile);
    });
  });
}

// Example usage:
(async () => {
  try {
    const pdfPath = await convertToPDF('./example.docx', './converted');
    console.log(`✅ PDF saved at: ${pdfPath}`);
  } catch (err) {
    console.error(`❌ ${err.message}`);
  }
})();

module.exports = { convertToPDF };
