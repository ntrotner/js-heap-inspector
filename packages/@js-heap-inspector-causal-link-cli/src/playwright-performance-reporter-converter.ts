import process from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Command,
} from 'commander';
import {
  PlaywrightPerformanceReporterParserService,
} from '@js-heap-inspector/core';

const program = new Command();

program
  .name('playwright-performance-reporter-converter')
  .description('CLI for extracting heaps from playwright-performance-reporter runs to V8 heap snapshots')
  .version('1.0.0')
  .argument('<input>', 'path to playwright-performance-reporter run (.json)')
  .option('-o, --output <output>', 'path to output V8 heap snapshot (.heapsnapshot) file')
  .action(async (inputPath: string, options: {output?: string}) => {
    try {
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input file not found: ${inputPath}`);
        // eslint-disable-next-line unicorn/no-process-exit -- CLI program
        process.exit(1);
      }

      const orchestrator = new PlaywrightPerformanceReporterParserService();
      const runtime = await orchestrator.parse(inputPath);
      const latestRecording = runtime.at(-1);
      if (!latestRecording) {
        console.error(`Error: Failed to parse playwright-performance-reporter run. It might be malformed or an unsupported version.`)
        process.exit(1);
      }

      const outputPath = options.output ?? `${path.basename(inputPath, path.extname(inputPath))}.heapsnapshot`;
      fs.writeFileSync(outputPath, latestRecording, 'utf8');

      console.log(`Input file: ${inputPath}`);
      console.log(`Output file: ${outputPath}`);
      console.log('');
    } catch (error) {
      console.error(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
      // eslint-disable-next-line unicorn/no-process-exit -- CLI program
      process.exit(1);
    }
  });

program.parse(process.argv);
