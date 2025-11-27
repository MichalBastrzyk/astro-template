import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import sharp from "sharp";

export type OgImageFormat = "webp" | "png" | "jpeg";

export interface OgImageOptions {
	/** Path to source image @default "src/assets/og-image.png" */
	input?: string;
	/** Output filename without extension @default "og-image" */
	outputName?: string;
	/** Output format @default "webp" */
	format?: OgImageFormat;
	/** Target size in KB @default 300 */
	targetSizeKB?: number;
	/** Width in pixels @default 1200 */
	width?: number;
	/** Height in pixels @default 630 */
	height?: number;
	/** Minimum quality @default 60 */
	minQuality?: number;
}

const FORMAT_EXT = { webp: ".webp", png: ".png", jpeg: ".jpg" } as const;

async function optimize(
	inputPath: string,
	format: OgImageFormat,
	width: number,
	height: number,
	targetBytes: number,
	minQuality: number
): Promise<{ buffer: Buffer; quality: number } | null> {
	for (let quality = 100; quality >= minQuality; quality -= 5) {
		const base = sharp(inputPath).resize(width, height, { fit: "cover", position: "center" });

		const buffer =
			format === "png"
				? await base
						.png({ compressionLevel: 9, palette: quality < 90, quality, effort: 10 })
						.toBuffer()
				: format === "jpeg"
					? await base.jpeg({ quality, mozjpeg: true }).toBuffer()
					: await base.webp({ quality, effort: 6, smartSubsample: true }).toBuffer();

		if (buffer.length <= targetBytes || quality === minQuality) {
			return { buffer, quality };
		}
	}
	return null;
}

export function ogImage(options: OgImageOptions = {}): AstroIntegration {
	const {
		input = "src/assets/og-image.png",
		outputName = "og-image",
		format = "webp",
		targetSizeKB = 300,
		width = 1200,
		height = 630,
		minQuality = 60,
	} = options;

	return {
		name: "@me/og-image",
		hooks: {
			"astro:build:done": async ({ dir, logger }) => {
				if (!existsSync(input)) {
					logger.warn(`Source image not found: ${input}`);
					return;
				}

				const outputDir = fileURLToPath(dir);
				const outputPath = join(outputDir, `${outputName}${FORMAT_EXT[format]}`);
				const originalBuffer = await sharp(input).toBuffer();
				const metadata = await sharp(input).metadata();

				logger.info(
					`Optimizing ${input} (${(originalBuffer.length / 1024).toFixed(0)}KB, ${metadata.width}x${metadata.height})`
				);

				const result = await optimize(
					input,
					format,
					width,
					height,
					targetSizeKB * 1024,
					minQuality
				);
				if (!result) {
					logger.error("Failed to optimize image");
					return;
				}

				if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
				writeFileSync(outputPath, result.buffer);

				const actualSize = statSync(outputPath).size;
				const reduction = (
					((originalBuffer.length - actualSize) / originalBuffer.length) *
					100
				).toFixed(1);
				const isUnder = actualSize <= targetSizeKB * 1024;

				logger.info(
					`${isUnder ? "✓" : "⚠"} ${outputName}${FORMAT_EXT[format]} (${(actualSize / 1024).toFixed(1)}KB, q${result.quality}, -${reduction}%)`
				);
			},
		},
	};
}
