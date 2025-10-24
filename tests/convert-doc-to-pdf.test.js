/**
 * Integration tests for LibreOffice-based document conversion
 * Run using:  npx jest
 */

const fs = require("fs/promises");
const path = require("path");
const { convertToPDF } = require("../src/convert-doc-to-pdf"); // adjust import if needed

// Temporary test output directory
const OUT_DIR = path.resolve(__dirname, "../tmp_test_output");

beforeAll(async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });
});

afterAll(async () => {
  // Clean up generated test PDFs
  await fs.rm(OUT_DIR, { recursive: true, force: true });
});

describe("Document to PDF Conversion (Integration Tests)", () => {
  const mockDocsDir = path.resolve(__dirname, "../src/mock_docs");

  test("converts a DOCX file to PDF successfully", async () => {
    const input = path.join(mockDocsDir, "sample.docx");
    const outputDir = OUT_DIR;
    const resultPath = await convertToPDF(input, outputDir);

    const stats = await fs.stat(resultPath);
    expect(stats.size).toBeGreaterThan(500); // Should produce a non-empty PDF
    expect(resultPath.endsWith(".pdf")).toBe(true);
  });

  test("converts an ODT file to PDF successfully", async () => {
    const input = path.join(mockDocsDir, "sample.odt");
    const outputDir = OUT_DIR;
    const resultPath = await convertToPDF(input, outputDir);

    const stats = await fs.stat(resultPath);
    expect(stats.size).toBeGreaterThan(500);
  });

  test("throws an error for non-existent input file", async () => {
    const badPath = path.join(mockDocsDir, "missing.docx");
    await expect(convertToPDF(badPath, OUT_DIR)).rejects.toThrow(/not found/i);
  });

  test("rejects unsupported input format", async () => {
    const txtFile = path.join(mockDocsDir, "unsupported.txt");
    await fs.writeFile(txtFile, "plain text content");
    await expect(convertToPDF(txtFile, OUT_DIR)).rejects.toThrow(/Unsupported input format:/i);
  });
});
