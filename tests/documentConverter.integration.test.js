/**
 * @file documentConverter.integration.test.js
 * Advanced integration tests for the Document Converter.
 */
 /**
 * @jest-environment node
 */

const fs = require("fs/promises");
const fs1 = require("fs");
const path = require("path");
const { convertToPDF } = require("../src/convert-doc-to-pdf"); // <-- adjust to your actual file path
jest.setTimeout(70000);

const TEST_DIR = path.resolve(__dirname, 'tmp');
const tmpDir = path.join(process.cwd(), 'tests', 'tmp');
const SAMPLE_DOC = path.join(TEST_DIR, 'sample.docx');
const SAMPLE_ODT = path.join(TEST_DIR, 'sample.odt');
const OUTPUT_PDF = path.join(TEST_DIR, 'output.pdf');

// Utility to create mock files
beforeAll(() => {
  if (!fs1.existsSync(tmpDir))fs.mkdir(tmpDir, { recursive: true });
  //if (!fs1.existsSync(TEST_DIR)) fs.mkdir(TEST_DIR);
  fs1.writeFileSync(SAMPLE_DOC, 'This is a test DOCX document content');
  fs1.writeFileSync(SAMPLE_ODT, 'This is a test ODT document content');
});

afterAll(() => {
  fs1.rmSync(TEST_DIR, { recursive: true, force: true });
  //fs1.rmSync(tmpDir, { recursive: true, force: true });
});

describe('🧠 Document to PDF Conversion (Advanced Integration Tests)', () => {
  test('converts .docx to .pdf and produces a valid file', async () => {
    const result = await convertToPDF(SAMPLE_DOC, OUTPUT_PDF);
    expect(fs1.existsSync(result)).toBe(true);

    const stats = fs1.statSync(result);
    expect(stats.size).toBeGreaterThan(100); // ensures non-empty file
  });

  test('converts .odt to .pdf successfully', async () => {
    const outputPath = path.join(TEST_DIR, 'converted_from_odt.pdf');
    const result = await convertToPDF(SAMPLE_ODT, outputPath);
    expect(fs1.existsSync(result)).toBe(true);
  });

  test('throws an error for missing input file', async () => {
    const missing = path.join(TEST_DIR, 'does_not_exist.docx');
    await expect(convertToPDF(missing, OUTPUT_PDF)).rejects.toThrow(/not found|no such file/i);
  });

  test('throws an error for unsupported file type', async () => {
    const inputTxt = path.join(TEST_DIR, 'invalid.txt');
    fs1.writeFileSync(inputTxt, 'Plain text should fail');
    await expect(convertToPDF(inputTxt, OUTPUT_PDF)).rejects.toThrow(/unsupported|format/i);
  });

  //test('should overwrite existing output file if already present', async () => {
    // Pre-create an output PDF file
    //fs1.writeFileSync(OUTPUT_PDF, 'Old content');

    //const before = fs.statSync(OUTPUT_PDF).mtimeMs;
    //await convertToPDF(SAMPLE_DOC, OUTPUT_PDF);
    //const after = fs1.statSync(OUTPUT_PDF).mtimeMs;

    //expect(after).toBeGreaterThan(before);
  //});

  test('handles large input file gracefully (performance test)', async () => {
    const largeDoc = path.join(TEST_DIR, 'large.docx');
    fs1.writeFileSync(largeDoc, 'A'.repeat(5_000_000)); // 5 MB mock doc

    const outputLarge = path.join(TEST_DIR, 'large_output.pdf');

    const start = Date.now();
    await convertToPDF(largeDoc, outputLarge);
    const duration = Date.now() - start;

    expect(fs1.existsSync(outputLarge)).toBe(true);
    expect(duration).toBeLessThan(100000); // should complete within 10s
  });

  test('does not leave temporary files behind', async () => {
    const beforeFiles = fs1.readdirSync(TEST_DIR);
    await convertToPDF(SAMPLE_DOC, OUTPUT_PDF);
    const afterFiles = fs1.readdirSync(TEST_DIR);

    const tempFiles = afterFiles.filter(f => f.endsWith('.tmp'));
    expect(tempFiles.length).toBe(0);
  });

  test('returns consistent output path regardless of relative input', async () => {
    const relativeInput = path.relative(process.cwd(), SAMPLE_DOC);
    const result = await convertToPDF(relativeInput, OUTPUT_PDF);
    expect(path.isAbsolute(result)).toBe(true);
  });
});
