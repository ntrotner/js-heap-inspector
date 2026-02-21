import process from 'node:process';
import * as fs from 'node:fs';
import {
  Command,
} from 'commander';

const program = new Command();

program
  .name('file-result-merger')
  .description('CLI merging file from thesis result json')
  .version('1.0.0')
  .requiredOption('-t, --target <target>', 'application to target')
  .action((options: {target: string}) => {
    if (options.target === 'otter') {
      mergeOtterResults();
    }
  });

program.parse(process.argv);

function mergeOtterResults() {
  const otterFileExports = [
    'otter-simple-showcase-community-detection-1',
    'otter-simple-showcase-community-detection-2',
    'otter-simple-showcase-community-detection-3',
    'otter-simple-showcase-community-detection-4',
    'otter-simple-showcase-community-detection-5',
    'otter-simple-showcase-heuristic-greedy-1',
    'otter-simple-showcase-heuristic-greedy-2',
    'otter-simple-showcase-heuristic-greedy-3',
    'otter-simple-showcase-heuristic-greedy-4',
    'otter-simple-showcase-heuristic-greedy-5',
    'otter-extensive-showcase-community-detection-1',
    'otter-extensive-showcase-community-detection-2',
    'otter-extensive-showcase-community-detection-3',
    'otter-extensive-showcase-community-detection-4',
    'otter-extensive-showcase-community-detection-5',
    'otter-extensive-showcase-heuristic-greedy-1',
    'otter-extensive-showcase-heuristic-greedy-2',
    'otter-extensive-showcase-heuristic-greedy-3',
    'otter-extensive-showcase-heuristic-greedy-4',
    'otter-extensive-showcase-heuristic-greedy-5',
  ].map(file => `./data/${file}/result-reporter-thesis_report.json`);
  const baseReplacementNeeded = {
    'http://localhost:4200/chunk-AHTFIUZH.js': 'http://localhost:4200/chunk-QEUBWBGP.js',
    'http://localhost:4200/chunk-OUCAF7IX.js': 'http://localhost:4200/chunk-VO5FH2ZN.js',
  };

  for (const file of otterFileExports) {
    let parsedContent;

    try {
      const unparsedFile = fs.readFileSync(file, 'utf8');
      parsedContent = JSON.parse(unparsedFile);
    } catch (error) {
      console.error(`Error parsing file ${file}: ${error}`);
      continue;
    }

    if (!parsedContent) {
      console.error(`Error parsing file ${file}`);
      continue;
    }

    fs.writeFileSync(`${file}.backup-${Date.now()}`, JSON.stringify(parsedContent, null, 2));

    const codeLinkFiles = parsedContent.output.code_link.files;
    for (const [target, source] of Object.entries(baseReplacementNeeded)) {
      if (codeLinkFiles[target]?.baseline && codeLinkFiles[source]?.baseline) {
        codeLinkFiles[target].baseline = codeLinkFiles[source].baseline;
        delete codeLinkFiles[source];
      }
    }

    fs.writeFileSync(file, JSON.stringify(parsedContent, null, 2));
  }
}
