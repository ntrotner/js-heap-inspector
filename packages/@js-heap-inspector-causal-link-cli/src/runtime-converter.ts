import process from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Command,
} from 'commander';
import {
  RuntimeParserOrchestrator,
} from '@js-heap-inspector/core';

const program = new Command();

program
  .name('runtime-converter')
  .description('CLI for converting V8 heap snapshots to common runtime format')
  .version('1.0.0')
  .argument('<input>', 'path to V8 heap snapshot (.heapsnapshot)')
  .option('-o, --output <output>', 'path to output JSON file')
  .action((inputPath: string, options: {output?: string}) => {
    try {
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input file not found: ${inputPath}`);
        // eslint-disable-next-line unicorn/no-process-exit -- CLI program
        process.exit(1);
      }

      const rawData = fs.readFileSync(inputPath, 'utf8');
      let snapshotData: unknown;
      try {
        snapshotData = JSON.parse(rawData);
      } catch {
        console.error('Error: Malformed JSON in heap snapshot file.');
        // eslint-disable-next-line unicorn/no-process-exit -- CLI program
        process.exit(1);
      }

      console.log('Starting to parse runtime...');
      const orchestrator = new RuntimeParserOrchestrator();
      const runtime = orchestrator.parse(snapshotData);
      if (!runtime) {
        console.error('Error: Failed to parse heap snapshot. It might be malformed or an unsupported version.');
        // eslint-disable-next-line unicorn/no-process-exit -- CLI program
        process.exit(1);
      }

      console.log('Runtime Converter Statistics');
      console.log(`Nodes: ${runtime.nodes.length}`);
      console.log(`Edges: ${runtime.edges.length}`);
      console.log(`Stacks: ${runtime.stacks.length}`);

      const outputPath = options.output ?? `${path.basename(inputPath, path.extname(inputPath))}.runtime.json`;
      fs.rmSync(outputPath, {force: true});
      const writeStream = fs.createWriteStream(outputPath);
      writeStream.write('{');
      writeStream.write('"nodes": [');

      let energyCounter = 0;
      for (const [index, node] of runtime.nodes.entries()) {
        if ('energy' in node) {
          energyCounter++;
        }

        writeStream.write(JSON.stringify(node, null, 2));
        if (index < runtime.nodes.length - 1) {
          writeStream.write(',');
        }
      }

      writeStream.write(']');

      writeStream.write(',\n"edges": [');

      for (const [index, edge] of runtime.edges.entries()) {
        writeStream.write(JSON.stringify(edge, null, 2));
        if (index < runtime.edges.length - 1) {
          writeStream.write(',');
        }
      }

      writeStream.write(']');

      writeStream.write(',\n"stacks": [');

      for (const [index, stack] of runtime.stacks.entries()) {
        writeStream.write(JSON.stringify(stack, null, 2));
        if (index < runtime.stacks.length - 1) {
          writeStream.write(',');
        }
      }

      writeStream.write(']');
      writeStream.write('}');
      writeStream.end();
      console.log(`Energy: ${energyCounter}`);
      console.log('');
      console.log('Writing output file...');
      console.log(`Input file: ${inputPath}`);
      console.log(`Output file: ${outputPath}`);
    } catch (error) {
      console.error(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
      // eslint-disable-next-line unicorn/no-process-exit -- CLI program
      process.exit(1);
    }
  });

program.parse(process.argv);
