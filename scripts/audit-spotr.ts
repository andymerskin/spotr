import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const repoRoot = join(import.meta.dirname, '..');
const spotrPackageDir = join(repoRoot, 'packages', 'spotr');
const packageJsonPath = join(spotrPackageDir, 'package.json');

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

interface PackageResult {
  vulnerabilities: {
    before: AuditResult['metadata']['vulnerabilities'];
    after: AuditResult['metadata']['vulnerabilities'];
  };
  fixed: number;
  updated: string[];
  errors: string[];
}

// Helper to run npm audit and parse JSON output
function runAudit(packageDir: string): AuditResult | null {
  try {
    const output = execSync('npm audit --json', {
      cwd: packageDir,
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

// Check if package.json exists
if (!existsSync(packageJsonPath)) {
  console.error(`❌ Error: package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

console.log('🔍 Auditing Spotr package...\n');

const result: PackageResult = {
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
  const initialAudit = runAudit(spotrPackageDir);
  if (initialAudit && initialAudit.metadata) {
    result.vulnerabilities.before = initialAudit.metadata.vulnerabilities;
  }

  const initialVulnCount = result.vulnerabilities.before.total;

  if (initialVulnCount === 0) {
    console.log('✅ No vulnerabilities found\n');
    process.exit(0);
  }

  console.log(
    `Found ${initialVulnCount} vulnerabilities (${result.vulnerabilities.before.critical} critical, ${result.vulnerabilities.before.high} high, ${result.vulnerabilities.before.moderate} moderate, ${result.vulnerabilities.before.low} low)\n`
  );

  // Try automatic fix first
  console.log('Attempting automatic fixes...');
  try {
    execSync('npm audit fix', {
      cwd: spotrPackageDir,
      stdio: 'pipe',
    });
    result.fixed += initialVulnCount; // npm audit fix handles what it can
  } catch {
    // npm audit fix may fail for some vulnerabilities, continue
  }

  // Re-run audit to see what's left
  const afterFixAudit = runAudit(spotrPackageDir);
  if (afterFixAudit && afterFixAudit.metadata) {
    result.vulnerabilities.after = afterFixAudit.metadata.vulnerabilities;
  }

  const remainingVulnCount = result.vulnerabilities.after.total;

  if (remainingVulnCount === 0) {
    console.log('✅ All vulnerabilities fixed\n');
  } else {
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
        `\nAttempting smart updates for ${affectedPackages.size} packages...`
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
        console.log('Reinstalling dependencies...');
        try {
          execSync('bun install', {
            cwd: spotrPackageDir,
            stdio: 'pipe',
          });
        } catch (error: unknown) {
          const errorObj = error as { message?: string };
          result.errors.push(
            `Failed to reinstall: ${errorObj.message || 'Unknown error'}`
          );
        }

        // Final audit
        const finalAudit = runAudit(spotrPackageDir);
        if (finalAudit && finalAudit.metadata) {
          result.vulnerabilities.after = finalAudit.metadata.vulnerabilities;
        }
      }
    }
  }

  // Verify compatibility with typecheck and test
  console.log('\nVerifying compatibility...');
  try {
    execSync('bun run typecheck', {
      cwd: spotrPackageDir,
      stdio: 'pipe',
    });
    console.log('✅ Typecheck passed');
  } catch {
    result.errors.push('Typecheck failed after updates');
    console.log('⚠️  Typecheck failed');
  }

  try {
    execSync('bun run test', {
      cwd: spotrPackageDir,
      stdio: 'pipe',
    });
    console.log('✅ Tests passed');
  } catch {
    result.errors.push('Tests failed after updates');
    console.log('⚠️  Tests failed');
  }

  const finalVulnCount = result.vulnerabilities.after.total;
  if (finalVulnCount === 0) {
    console.log('\n✅ All vulnerabilities resolved!');
  } else {
    console.log(
      `\n⚠️  ${finalVulnCount} vulnerabilities remain (${result.vulnerabilities.after.critical} critical, ${result.vulnerabilities.after.high} high, ${result.vulnerabilities.after.moderate} moderate, ${result.vulnerabilities.after.low} low)`
    );
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(
    `Vulnerabilities: ${result.vulnerabilities.before.total} → ${result.vulnerabilities.after.total}`
  );
  if (result.updated.length > 0) {
    console.log(`Updated packages: ${result.updated.join(', ')}`);
  }
  if (result.errors.length > 0) {
    console.log(`Errors: ${result.errors.join('; ')}`);
  }
  console.log('='.repeat(60) + '\n');

  if (finalVulnCount > 0) {
    console.log(
      '⚠️  Some vulnerabilities remain. These may require manual intervention or major version updates.'
    );
    process.exit(1);
  } else if (result.vulnerabilities.before.total > 0) {
    console.log('✅ All vulnerabilities have been resolved!');
    process.exit(0);
  } else {
    console.log('✅ No vulnerabilities found.');
    process.exit(0);
  }
} catch (error: unknown) {
  const errorObj = error as { message?: string };
  const errorMessage = errorObj.message || 'Unknown error';
  result.errors.push(errorMessage);
  console.error(`❌ Error: ${errorMessage}\n`);
  process.exit(1);
}
