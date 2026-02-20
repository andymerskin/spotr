import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
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

interface Vulnerability {
  name: string;
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
  via: Array<{ name: string; range: string }>;
  effects: string[];
  title: string;
  url: string;
}

interface AuditResult {
  vulnerabilities: Record<string, Vulnerability>;
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
  };
}

interface ExampleResult {
  framework: string;
  example: string;
  vulnerabilities: {
    before: AuditResult['metadata']['vulnerabilities'];
    after: AuditResult['metadata']['vulnerabilities'];
  };
  fixed: number;
  updated: string[];
  errors: string[];
}

const results: ExampleResult[] = [];

// Helper to run npm audit and parse JSON output
function runAudit(exampleDir: string): AuditResult | null {
  try {
    const output = execSync('npm audit --json', {
      cwd: exampleDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return JSON.parse(output) as AuditResult;
  } catch (error: unknown) {
    // npm audit exits with non-zero if vulnerabilities exist, but still outputs JSON
    try {
      const errorObj = error as { stdout?: string; message?: string };
      const output = errorObj.stdout || errorObj.message || '';
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as AuditResult;
      }
    } catch {
      // If we can't parse, return null
    }
    return null;
  }
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// Helper to get current version from package.json
function getCurrentVersion(
  packageJson: PackageJson,
  packageName: string
): string | null {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  return deps[packageName] || null;
}

// Helper to parse semver range and determine if update is safe (patch/minor only)
function canUpdateSafely(currentRange: string, newVersion: string): boolean {
  // Remove ^, ~, >=, etc. to get base version
  const baseVersion = currentRange.replace(/^[\^~>=<]+\s*/, '');
  const [currentMajor] = baseVersion.split('.').map(Number);
  const [newMajor] = newVersion.split('.').map(Number);

  // Don't update if major version changes
  if (newMajor > currentMajor) {
    return false;
  }

  // Allow minor and patch updates
  return true;
}

// Helper to update package.json with new version
function updatePackageVersion(
  packageJson: PackageJson,
  packageName: string,
  newVersion: string
): boolean {
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};

  if (deps[packageName]) {
    const currentRange = deps[packageName];
    if (canUpdateSafely(currentRange, newVersion)) {
      // Preserve the range prefix (^ or ~) if present
      const prefix = currentRange.match(/^[\^~]/)?.[0] || '';
      deps[packageName] = `${prefix}${newVersion}`;
      return true;
    }
  }

  if (devDeps[packageName]) {
    const currentRange = devDeps[packageName];
    if (canUpdateSafely(currentRange, newVersion)) {
      const prefix = currentRange.match(/^[\^~]/)?.[0] || '';
      devDeps[packageName] = `${prefix}${newVersion}`;
      return true;
    }
  }

  return false;
}

// Helper to get latest version for a package (within same major)
function getLatestVersion(
  packageName: string,
  currentMajor: number
): string | null {
  try {
    const output = execSync(`npm view ${packageName} versions --json`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    const versions = JSON.parse(output) as string[];
    // Find latest version with same major version
    const compatibleVersions = versions.filter((v) => {
      const major = parseInt(v.split('.')[0]);
      return major === currentMajor;
    });
    return compatibleVersions[compatibleVersions.length - 1] || null;
  } catch {
    return null;
  }
}

// Process each example
for (const framework of frameworks) {
  for (const example of examples) {
    const exampleDir = join(repoRoot, 'examples', framework, example);
    const packageJsonPath = join(exampleDir, 'package.json');

    if (!existsSync(packageJsonPath)) {
      console.log(`⏭️  Skipping ${framework}/${example} (no package.json)\n`);
      continue;
    }

    console.log(`🔍 Auditing ${framework}/${example}...`);

    const result: ExampleResult = {
      framework,
      example,
      vulnerabilities: {
        before: {
          info: 0,
          low: 0,
          moderate: 0,
          high: 0,
          critical: 0,
          total: 0,
        },
        after: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
      },
      fixed: 0,
      updated: [],
      errors: [],
    };

    try {
      // Run initial audit
      const initialAudit = runAudit(exampleDir);
      if (initialAudit && initialAudit.metadata) {
        result.vulnerabilities.before = initialAudit.metadata.vulnerabilities;
      }

      const initialVulnCount = result.vulnerabilities.before.total;

      if (initialVulnCount === 0) {
        console.log(`✅ ${framework}/${example} - No vulnerabilities found\n`);
        results.push(result);
        continue;
      }

      console.log(
        `   Found ${initialVulnCount} vulnerabilities (${result.vulnerabilities.before.critical} critical, ${result.vulnerabilities.before.high} high, ${result.vulnerabilities.before.moderate} moderate, ${result.vulnerabilities.before.low} low)`
      );

      // Try automatic fix first
      console.log(`   Attempting automatic fixes...`);
      try {
        execSync('npm audit fix', {
          cwd: exampleDir,
          stdio: 'pipe',
        });
        result.fixed += initialVulnCount; // npm audit fix handles what it can
      } catch {
        // npm audit fix may fail for some vulnerabilities, continue
      }

      // Re-run audit to see what's left
      const afterFixAudit = runAudit(exampleDir);
      if (afterFixAudit && afterFixAudit.metadata) {
        result.vulnerabilities.after = afterFixAudit.metadata.vulnerabilities;
      }

      const remainingVulnCount = result.vulnerabilities.after.total;

      if (remainingVulnCount === 0) {
        console.log(`✅ ${framework}/${example} - All vulnerabilities fixed\n`);
        results.push(result);
        continue;
      }

      // For remaining vulnerabilities, try smart updates
      if (initialAudit && initialAudit.vulnerabilities) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

        const affectedPackages = new Set<string>();
        for (const vuln of Object.values(initialAudit.vulnerabilities)) {
          for (const via of vuln.via) {
            if (via.name && via.name !== vuln.name) {
              affectedPackages.add(via.name);
            }
          }
        }

        console.log(
          `   Attempting smart updates for ${affectedPackages.size} packages...`
        );

        let updatedCount = 0;
        for (const packageName of Array.from(affectedPackages)) {
          const currentVersion = getCurrentVersion(packageJson, packageName);
          if (!currentVersion) continue;

          const baseVersion = currentVersion.replace(/^[\^~>=<]+\s*/, '');
          const currentMajor = parseInt(baseVersion.split('.')[0]);

          const latestVersion = getLatestVersion(packageName, currentMajor);
          if (!latestVersion || latestVersion === baseVersion) continue;

          if (updatePackageVersion(packageJson, packageName, latestVersion)) {
            result.updated.push(`${packageName}@${latestVersion}`);
            updatedCount++;
          }
        }

        if (updatedCount > 0) {
          // Write updated package.json
          writeFileSync(
            packageJsonPath,
            JSON.stringify(packageJson, null, 2) + '\n',
            'utf-8'
          );

          // Reinstall to update lock file
          console.log(`   Reinstalling dependencies...`);
          try {
            execSync('npm install', {
              cwd: exampleDir,
              stdio: 'pipe',
            });
          } catch (error: unknown) {
            const errorObj = error as { message?: string };
            result.errors.push(
              `Failed to reinstall: ${errorObj.message || 'Unknown error'}`
            );
          }

          // Final audit
          const finalAudit = runAudit(exampleDir);
          if (finalAudit && finalAudit.metadata) {
            result.vulnerabilities.after = finalAudit.metadata.vulnerabilities;
          }
        }
      }

      // Verify compatibility with typecheck
      console.log(`   Verifying compatibility...`);
      try {
        execSync('bun run typecheck', {
          cwd: exampleDir,
          stdio: 'pipe',
        });
        console.log(`✅ ${framework}/${example} - Typecheck passed`);
      } catch {
        result.errors.push('Typecheck failed after updates');
        console.log(`⚠️  ${framework}/${example} - Typecheck failed`);
      }

      const finalVulnCount = result.vulnerabilities.after.total;
      if (finalVulnCount === 0) {
        console.log(
          `✅ ${framework}/${example} - All vulnerabilities resolved\n`
        );
      } else {
        console.log(
          `⚠️  ${framework}/${example} - ${finalVulnCount} vulnerabilities remain\n`
        );
      }

      results.push(result);
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      const errorMessage = errorObj.message || 'Unknown error';
      result.errors.push(errorMessage);
      console.error(`❌ ${framework}/${example} - Error: ${errorMessage}\n`);
      results.push(result);
    }
  }
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 AUDIT SUMMARY');
console.log('='.repeat(60) + '\n');

let totalBefore = 0;
let totalAfter = 0;
let totalFixed = 0;
let totalUpdated = 0;
let totalErrors = 0;

for (const result of results) {
  totalBefore += result.vulnerabilities.before.total;
  totalAfter += result.vulnerabilities.after.total;
  totalFixed += result.fixed;
  totalUpdated += result.updated.length;
  totalErrors += result.errors.length;

  if (
    result.vulnerabilities.before.total > 0 ||
    result.updated.length > 0 ||
    result.errors.length > 0
  ) {
    console.log(`${result.framework}/${result.example}:`);
    if (result.vulnerabilities.before.total > 0) {
      console.log(
        `  Vulnerabilities: ${result.vulnerabilities.before.total} → ${result.vulnerabilities.after.total}`
      );
    }
    if (result.updated.length > 0) {
      console.log(`  Updated packages: ${result.updated.join(', ')}`);
    }
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.join('; ')}`);
    }
    console.log('');
  }
}

console.log('='.repeat(60));
console.log(`Total vulnerabilities: ${totalBefore} → ${totalAfter}`);
console.log(`Auto-fixed: ${totalFixed}`);
console.log(`Packages updated: ${totalUpdated}`);
if (totalErrors > 0) {
  console.log(`Errors encountered: ${totalErrors}`);
}
console.log('='.repeat(60) + '\n');

if (totalAfter > 0) {
  console.log(
    '⚠️  Some vulnerabilities remain. These may require manual intervention or major version updates.'
  );
  process.exit(1);
} else if (totalBefore > 0) {
  console.log('✅ All vulnerabilities have been resolved!');
} else {
  console.log('✅ No vulnerabilities found in any examples.');
}
