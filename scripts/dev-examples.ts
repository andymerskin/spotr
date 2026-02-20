import { existsSync } from 'fs';
import { join } from 'path';

const frameworks = ['react', 'vue', 'svelte', 'solid', 'preact'];
const examples = [
  'fields-basic',
  'fields-nested',
  'keywords-basic',
  'keywords-advanced',
  'advanced-combined',
];
const repoRoot = join(import.meta.dirname, '..');
const examplesDir = join(repoRoot, 'examples');
const START_PORT = 5173;

// Interactive framework selection
async function selectFramework(): Promise<string> {
  console.log('\n📦 Available frameworks:\n');
  frameworks.forEach((fw, index) => {
    console.log(`  ${index + 1}. ${fw}`);
  });
  console.log('');

  const prompt = 'Select a framework (1-5): ';
  process.stdout.write(prompt);

  return new Promise((resolve) => {
    process.stdin.once('data', (data: Buffer) => {
      const input = data.toString().trim();
      const index = parseInt(input, 10) - 1;

      if (index >= 0 && index < frameworks.length) {
        resolve(frameworks[index]);
      } else {
        console.error(
          `\n❌ Invalid selection. Please choose 1-${frameworks.length}`
        );
        process.exit(1);
      }
    });
  });
}

// Get available examples for a framework
function getExamplesForFramework(framework: string): string[] {
  const frameworkDir = join(examplesDir, framework);
  if (!existsSync(frameworkDir)) {
    console.error(`\n❌ Framework directory not found: ${frameworkDir}`);
    process.exit(1);
  }

  const availableExamples = examples.filter((example) => {
    const exampleDir = join(frameworkDir, example);
    return existsSync(exampleDir);
  });

  if (availableExamples.length === 0) {
    console.error(`\n❌ No examples found for framework: ${framework}`);
    process.exit(1);
  }

  return availableExamples;
}

// Launch dev servers
async function launchDevServers(framework: string, exampleList: string[]) {
  console.log(`\n🚀 Launching dev servers for ${framework}...\n`);

  const processes: Array<{ name: string; process: Bun.Subprocess }> = [];
  const urls: Array<{ name: string; url: string }> = [];

  // Spawn all dev servers
  for (let i = 0; i < exampleList.length; i++) {
    const example = exampleList[i];
    const port = START_PORT + i;
    const exampleDir = join(examplesDir, framework, example);
    const url = `http://localhost:${port}`;

    urls.push({ name: example, url });

    // Spawn bun run dev with port flag
    const proc = Bun.spawn(
      ['bun', 'run', 'dev', '--', '--port', port.toString(), '--host'],
      {
        cwd: exampleDir,
        stdout: 'pipe',
        stderr: 'pipe',
        env: { ...process.env },
      }
    );

    processes.push({ name: example, process: proc });

    // Handle stdout with prefix
    proc.stdout?.pipeTo(
      new WritableStream({
        write(chunk: Uint8Array) {
          const output = new TextDecoder().decode(chunk);
          const lines = output
            .split('\n')
            .filter((line: string) => line.trim());
          for (const line of lines) {
            // Only show Vite's local URL output, filter out other noise
            if (line.includes('Local:') || line.includes('Network:')) {
              console.log(`[${example.padEnd(20)}] ${line}`);
            }
          }
        },
      })
    );

    // Handle stderr with prefix
    proc.stderr?.pipeTo(
      new WritableStream({
        write(chunk: Uint8Array) {
          const output = new TextDecoder().decode(chunk);
          const lines = output
            .split('\n')
            .filter((line: string) => line.trim());
          for (const line of lines) {
            console.error(`[${example.padEnd(20)}] ${line}`);
          }
        },
      })
    );
  }

  // Print clickable URLs
  console.log('\n' + '='.repeat(60));
  console.log('✨ Dev servers are starting! Click the URLs below:\n');
  urls.forEach(({ name, url }) => {
    console.log(`  📍 ${name.padEnd(20)} → ${url}`);
  });
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Press Ctrl+C to stop all servers\n');

  // Wait for all processes
  const exitPromises = processes.map(({ process }) => process.exited);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping all dev servers...\n');
    processes.forEach(({ process }) => {
      process.kill();
    });
    process.exit(0);
  });

  // Wait for any process to exit (they shouldn't unless there's an error)
  await Promise.race(exitPromises);
}

// Main execution
async function main() {
  const framework = await selectFramework();
  const exampleList = getExamplesForFramework(framework);
  await launchDevServers(framework, exampleList);
}

main().catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
