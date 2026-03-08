import { chromium, type Page } from 'playwright';

const frameworks = ['react', 'vue', 'svelte', 'solid', 'preact'];
const examples = [
  'fields-basic',
  'fields-nested',
  'keywords-basic',
  'keywords-advanced',
  'advanced-combined',
];

const SITE_URL = process.env.SITE_URL || 'https://andymerskin.github.io/spotr';
const BATCH_SIZE = 5;

/**
 * Constructs the URL for an example page
 */
function getExampleUrl(example: string, framework: string): string {
  return `${SITE_URL}/examples/${example}/${framework}`;
}

/**
 * Visits a single example page and waits for the StackBlitz iframe to load
 */
async function warmExample(
  page: Page,
  example: string,
  framework: string
): Promise<void> {
  const url = getExampleUrl(example, framework);
  console.log(`🌐 Visiting ${example}/${framework}...`);

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for the StackBlitz iframe to have its src attribute set
    // This confirms the SDK executed and the request to StackBlitz was dispatched
    await page.waitForSelector('#stackblitz-embed iframe[src]', {
      timeout: 30000, // 30 second timeout per page
    });

    console.log(`✅ ${example}/${framework} warmed successfully`);
  } catch (error) {
    console.error(`❌ Failed to warm ${example}/${framework}:`, error);
    throw error;
  }
}

async function main() {
  console.log(`🔥 Starting StackBlitz warm-up for ${SITE_URL}\n`);

  // Generate all 25 URLs (5 examples × 5 frameworks)
  const urls: Array<{ example: string; framework: string }> = [];
  for (const example of examples) {
    for (const framework of frameworks) {
      urls.push({ example, framework });
    }
  }

  console.log(`📋 Found ${urls.length} example pages to warm\n`);

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const failures: Array<{
    example: string;
    framework: string;
    error: unknown;
  }> = [];

  try {
    // Process URLs in batches to avoid overwhelming the runner and StackBlitz
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      console.log(
        `📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(urls.length / BATCH_SIZE)} (${batch.length} pages)...\n`
      );

      await Promise.all(
        batch.map(async ({ example, framework }) => {
          const page = await context.newPage();
          try {
            await warmExample(page, example, framework);
          } catch (error) {
            failures.push({ example, framework, error });
          } finally {
            await page.close();
          }
        })
      );

      console.log(''); // Empty line between batches
    }
  } finally {
    await browser.close();
  }

  // Report results
  console.log('\n📊 Warm-up Summary:');
  console.log(
    `✅ Successfully warmed: ${urls.length - failures.length}/${urls.length}`
  );
  if (failures.length > 0) {
    console.log(`❌ Failed: ${failures.length}/${urls.length}`);
    console.log('\nFailed pages:');
    for (const { example, framework, error } of failures) {
      console.log(
        `  - ${example}/${framework}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    process.exit(1);
  } else {
    console.log('🎉 All examples warmed successfully!');
  }
}

main().catch((error) => {
  console.error('❌ Warm-up script failed:', error);
  process.exit(1);
});
