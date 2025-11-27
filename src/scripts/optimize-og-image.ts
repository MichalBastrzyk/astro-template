/** biome-ignore-all lint/suspicious/noConsole: This is a CLI */
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

// Configuration
const INPUT_PATH = "src/pages/og-image.png";
const TARGET_SIZE_KB = 300;
const TARGET_SIZE_BYTES = TARGET_SIZE_KB * 1024;
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

interface OptimizationResult {
	success: boolean;
	inputPath: string;
	outputPath: string;
	originalSize: number;
	optimizedSize: number;
	format: string;
	quality: number;
}

async function optimizeImage(inputPath: string, outputDir: string): Promise<OptimizationResult> {
	// Read original image
	const image = sharp(inputPath);
	const metadata = await image.metadata();
	const originalBuffer = await sharp(inputPath).toBuffer();
	const originalSize = originalBuffer.length;

	console.log(`\n📷 Original image: ${inputPath}`);
	console.log(`   Size: ${(originalSize / 1024).toFixed(2)} KB`);
	console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);
	console.log(`   Format: ${metadata.format}`);

	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	const outputFileName = "og-image";

	const formats = [
		{ name: "png", ext: ".png" },
		{ name: "jpeg", ext: ".jpg" },
		{ name: "webp", ext: ".webp" },
	] as const;

	type FormatResult = {
		format: string;
		ext: string;
		quality: number;
		buffer: Buffer;
		size: number;
	};

	const results: FormatResult[] = [];

	for (const format of formats) {
		// Start with high quality and decrease until under target size
		for (let quality = 100; quality >= 60; quality -= 5) {
			const baseImage = sharp(inputPath).resize(OG_WIDTH, OG_HEIGHT, {
				fit: "cover",
				position: "center",
			});

			let optimizedBuffer: Buffer = Buffer.alloc(0);

			switch (format.name) {
				case "png":
					optimizedBuffer = await baseImage
						.png({
							compressionLevel: 9,
							palette: quality < 90, // Use palette for smaller sizes
							quality: quality, // Only used when palette is true
							effort: 10, // Max effort for smallest size
						})
						.toBuffer();

					break;
				case "jpeg":
					optimizedBuffer = await baseImage
						.jpeg({
							quality,
							mozjpeg: true, // Use mozjpeg for better compression
						})
						.toBuffer();
					break;
				case "webp":
					optimizedBuffer = await baseImage
						.webp({
							quality,
							effort: 6, // Higher effort = better compression
							smartSubsample: true,
						})
						.toBuffer();
					break;
				default:
					break;
			}

			const size = optimizedBuffer.length;

			if (size <= TARGET_SIZE_BYTES) {
				results.push({
					format: format.name,
					ext: format.ext,
					quality,
					buffer: optimizedBuffer,
					size,
				});
				break;
			}

			if (quality === 60) {
				results.push({
					format: format.name,
					ext: format.ext,
					quality,
					buffer: optimizedBuffer,
					size,
				});
			}
		}
	}

	// Sort results: prefer those under target size, then by highest quality
	results.sort((a, b) => {
		const aUnder = a.size <= TARGET_SIZE_BYTES;
		const bUnder = b.size <= TARGET_SIZE_BYTES;

		if (aUnder && !bUnder) return -1;
		if (!aUnder && bUnder) return 1;

		// Both under or both over: prefer highest quality first, then smallest size as tiebreaker
		if (a.quality !== b.quality) {
			return b.quality - a.quality;
		}
		return a.size - b.size;
	});

	if (results.length === 0) {
		throw new Error("No optimization results generated");
	}

	console.log("\n📊 Formats generated (buffer sizes, actual file sizes may differ):");
	for (const result of results) {
		console.log(
			`   - ${result.format.toUpperCase()} (q${result.quality}): ~${(result.size / 1024).toFixed(0)} KB buffer`
		);
	}

	// Write all results to output directory and get actual file sizes
	console.log("\n📁 Saving all formats:");

	type SavedFile = {
		path: string;
		size: number;
		result: FormatResult;
	};

	const savedFiles: SavedFile[] = [];

	for (const result of results) {
		const outputPath = join(outputDir, `${outputFileName}${result.ext}`);
		// Write buffer directly to avoid re-encoding
		writeFileSync(outputPath, result.buffer);
		// Get actual file size from disk
		const actualSize = statSync(outputPath).size;
		savedFiles.push({ path: outputPath, size: actualSize, result });
	}

	// Sort saved files by quality (highest first), then by size (smallest first)
	savedFiles.sort((a, b) => {
		if (a.result.quality !== b.result.quality) {
			return b.result.quality - a.result.quality;
		}
		return a.size - b.size;
	});

	// Find actual best (highest quality under target, or smallest if all over)
	const underTarget = savedFiles.filter((f) => f.size <= TARGET_SIZE_BYTES);
	const actualBest = underTarget.length > 0 ? underTarget[0] : savedFiles[savedFiles.length - 1];

	for (const file of savedFiles) {
		const isUnder = file.size <= TARGET_SIZE_BYTES;
		const isBest = file === actualBest;
		const marker = isBest ? "⭐" : isUnder ? "✓" : "✗";
		console.log(
			`   ${marker} ${file.path} (${(file.size / 1024).toFixed(2)} KB)${isBest ? " ← recommended" : ""}`
		);
	}

	const bestFile = actualBest as SavedFile;
	console.log(`\n✨ All formats saved to ${outputDir}`);
	console.log(
		`   Best option: og-image${bestFile.result.ext} (${bestFile.result.format.toUpperCase()}, q${bestFile.result.quality})`
	);
	console.log(`   Size: ${(bestFile.size / 1024).toFixed(2)} KB`);
	console.log(
		`   Reduction: ${(((originalSize - bestFile.size) / originalSize) * 100).toFixed(1)}%`
	);

	return {
		success: bestFile.size <= TARGET_SIZE_BYTES,
		inputPath,
		outputPath: bestFile.path,
		originalSize,
		optimizedSize: bestFile.size,
		format: bestFile.result.format,
		quality: bestFile.result.quality,
	};
}

async function main() {
	const outputDir = join(process.cwd(), "public");

	if (!existsSync(INPUT_PATH)) {
		console.error(`❌ Error: File not found: ${INPUT_PATH}`);
		process.exit(1);
	}

	try {
		const result = await optimizeImage(INPUT_PATH, outputDir);

		if (!result.success) {
			console.log(
				`\n⚠️  Warning: Could not get image under ${TARGET_SIZE_KB}KB while maintaining quality.`
			);
			console.log("   Consider using a simpler image design or fewer colors.");
		}
	} catch (error) {
		console.error("❌ Error optimizing image:", error);
		process.exit(1);
	}
}

main();
