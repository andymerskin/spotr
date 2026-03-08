import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  type AuditResult,
  type OutdatedResult,
  type PackageJson,
  runAudit,
  checkOutdatedPackages,
  isWorkspaceDependency,
  getCurrentVersion,
  updatePackageVersion,
  getLatestVersion,
} from './audit-utils.js';

const repoRoot = join(import.meta.dirname, '..');
const frameworks = ['react', 'vue', 'svelte', 'solid', 'preact'];
const exampleTypes = [
  'fields-basic',
  'fields-nested',
  'keywords-basic',
  'keywords-advanced',
  'advanced-combined',
];

interface PackageAuditResult {
  name: string;
  path: string;
  category: 'spotr' | 'example' | 'root' | 'site';
  vulnerabilities: {
    before: AuditResult['metadata']['vulnerabilities'];
    after: AuditResult['metadata']['vulnerabilities'];
  };
  fixed: number;
  updated: string[];
  errors: string[];
}

const results: PackageAuditResult[] = [];

/**
 * Shared logic: audit, fix, and verify a package
 */
function auditAndFixPackage(
  name: string,
  packageDir: string,
  category: 'spotr' | 'example' | 'root' | 'site'
): PackageAuditResult | null {
  const packageJsonPath = join(packageDir, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  console.log(`🔍 Auditing ${name}...`);

  const result: PackageAuditResult = {
    name,
    path: packageDir,
    category,
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
    // Initial audit
    const initialAudit = runAudit(packageDir);
    if (initialAudit && initialAudit.metadata) {
      result.vulnerabilities.before = initialAudit.metadata.vulnerabilities;
    }

    const initialVulnCount = result.vulnerabilities.before.total;

    // For root and site, only report (no fixing)
    if (category === 'root' || category === 'site') {
      // Check for outdated packages
      const outdatedResult = checkOutdatedPackages(packageDir);
      if (outdatedResult) {
        const filtered: OutdatedResult = {};
        const packageJson = JSON.parse(
          readFileSync(packageJsonPath, 'utf-8')
        ) as PackageJson;

        for (const [pkgName, pkgInfo] of Object.entries(outdatedResult)) {
          const currentVersion =
            packageJson.dependencies?.[pkgName] ||
            packageJson.devDependencies?.[pkgName];
          if (currentVersion && !isWorkspaceDependency(currentVersion)) {
            filtered[pkgName] = pkgInfo;
          }
        }

        if (Object.keys(filtered).length > 0) {
          for (const [pkgName, pkgInfo] of Object.entries(filtered)) {
            console.log(
              `   Outdated: ${pkgName}: ${pkgInfo.current} → ${pkgInfo.latest}`
            );
          }
        }
      }

      if (initialVulnCount === 0) {
        console.log(`✅ ${name} - No vulnerabilities\n`);
      } else {
        console.log(
          `⚠️  ${name} - ${initialVulnCount} vulnerabilities (report only)\n`
        );
        result.vulnerabilities.after = result.vulnerabilities.before;
      }

      return result;
    }

    // For spotr and examples: audit, fix, and verify
    if (initialVulnCount === 0) {
      console.log(`✅ ${name} - No vulnerabilities found\n`);
      return result;
    }

    console.log(
      `   Found ${initialVulnCount} vulnerabilities (${result.vulnerabilities.before.critical} critical, ${result.vulnerabilities.before.high} high, ${result.vulnerabilities.before.moderate} moderate, ${result.vulnerabilities.before.low} low)`
    );

    // Try automatic fix first
    console.log(`   Attempting automatic fixes...`);
    try {
      execSync('npm audit fix', {
        cwd: packageDir,
        stdio: 'pipe',
      });
      result.fixed += initialVulnCount;
    } catch {
      // npm audit fix may fail for some vulnerabilities, continue
    }

    // Re-run audit to see what's left
    const afterFixAudit = runAudit(packageDir);
    if (afterFixAudit && afterFixAudit.metadata) {
      result.vulnerabilities.after = afterFixAudit.metadata.vulnerabilities;
    }

    const remainingVulnCount = result.vulnerabilities.after.total;

    if (remainingVulnCount === 0) {
      console.log(`✅ ${name} - All vulnerabilities fixed\n`);
      return result;
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
        const installCmd = category === 'spotr' ? 'bun install' : 'npm install';
        try {
          execSync(installCmd, {
            cwd: packageDir,
            stdio: 'pipe',
          });
        } catch (error: unknown) {
          const errorObj = error as { message?: string };
          result.errors.push(
            `Failed to reinstall: ${errorObj.message || 'Unknown error'}`
          );
        }

        // Final audit
        const finalAudit = runAudit(packageDir);
        if (finalAudit && finalAudit.metadata) {
          result.vulnerabilities.after = finalAudit.metadata.vulnerabilities;
        }
      }
    }

    // Verify compatibility
    console.log(`   Verifying compatibility...`);

    // All packages run typecheck
    try {
      const typecheckCmd =
        category === 'spotr' ? 'bun run typecheck' : 'bun run typecheck';
      execSync(typecheckCmd, {
        cwd: packageDir,
        stdio: 'pipe',
      });
      console.log(`✅ ${name} - Typecheck passed`);
    } catch {
      result.errors.push('Typecheck failed after updates');
      console.log(`⚠️  ${name} - Typecheck failed`);
    }

    // Only spotr runs tests
    if (category === 'spotr') {
      try {
        execSync('bun run test', {
          cwd: packageDir,
          stdio: 'pipe',
        });
        console.log(`✅ ${name} - Tests passed`);
      } catch {
        result.errors.push('Tests failed after updates');
        console.log(`⚠️  ${name} - Tests failed`);
      }
    }

    const finalVulnCount = result.vulnerabilities.after.total;
    if (finalVulnCount === 0) {
      console.log(`✅ ${name} - All vulnerabilities resolved\n`);
    } else {
      console.log(`⚠️  ${name} - ${finalVulnCount} vulnerabilities remain\n`);
    }

    return result;
  } catch (error: unknown) {
    const errorObj = error as { message?: string };
    const errorMessage = errorObj.message || 'Unknown error';
    result.errors.push(errorMessage);
    console.error(`❌ ${name} - Error: ${errorMessage}\n`);
    return result;
  }
}

/**
 * Generate unified report
 */
function generateReport(results: PackageAuditResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE AUDIT REPORT');
  console.log('='.repeat(80) + '\n');

  let totalVulnsBefore = 0;
  let totalVulnsAfter = 0;
  let totalFixed = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  // Group results by category
  const categories = {
    spotr: results.filter((r) => r.category === 'spotr'),
    examples: results.filter((r) => r.category === 'example'),
    other: results.filter(
      (r) => r.category === 'root' || r.category === 'site'
    ),
  };

  // Spotr section
  if (categories.spotr.length > 0) {
    console.log('🎯 SPOTR PACKAGE');
    console.log('-'.repeat(40));
    for (const result of categories.spotr) {
      console.log(`${result.name}:`);
      console.log(
        `  Vulnerabilities: ${result.vulnerabilities.before.total} → ${result.vulnerabilities.after.total}`
      );
      if (result.updated.length > 0) {
        console.log(`  Updated packages: ${result.updated.join(', ')}`);
      }
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.join('; ')}`);
      }
      console.log('');

      totalVulnsBefore += result.vulnerabilities.before.total;
      totalVulnsAfter += result.vulnerabilities.after.total;
      totalFixed += result.fixed;
      totalUpdated += result.updated.length;
      totalErrors += result.errors.length;
    }
  }

  // Examples section
  if (categories.examples.length > 0) {
    console.log('📚 EXAMPLES');
    console.log('-'.repeat(40));
    let examplesWithIssues = 0;
    for (const result of categories.examples) {
      if (
        result.vulnerabilities.before.total > 0 ||
        result.updated.length > 0 ||
        result.errors.length > 0
      ) {
        examplesWithIssues++;
        console.log(`${result.name}:`);
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

      totalVulnsBefore += result.vulnerabilities.before.total;
      totalVulnsAfter += result.vulnerabilities.after.total;
      totalFixed += result.fixed;
      totalUpdated += result.updated.length;
      totalErrors += result.errors.length;
    }

    if (examplesWithIssues === 0) {
      console.log('✅ All examples are clean\n');
    }
  }

  // Root/site section
  if (categories.other.length > 0) {
    console.log('🏠 WORKSPACE & SITE');
    console.log('-'.repeat(40));
    for (const result of categories.other) {
      console.log(
        `${result.name}: ${result.vulnerabilities.before.total} vulnerabilities (report only)\n`
      );
      totalVulnsBefore += result.vulnerabilities.before.total;
    }
  }

  // Summary
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(
    `Total vulnerabilities: ${totalVulnsBefore} → ${totalVulnsAfter}`
  );
  console.log(`Auto-fixed: ${totalFixed}`);
  console.log(`Packages updated: ${totalUpdated}`);
  if (totalErrors > 0) {
    console.log(`Errors encountered: ${totalErrors}`);
  }
  console.log('='.repeat(80) + '\n');

  if (totalVulnsAfter > 0) {
    console.log(
      '⚠️  Some vulnerabilities remain. These may require manual intervention or major version updates.'
    );
  } else if (totalVulnsBefore > 0) {
    console.log('✅ All vulnerabilities have been resolved!');
  } else {
    console.log('✅ No vulnerabilities found across all packages!');
  }
}

// Main execution
console.log('🔍 Running comprehensive package audit...\n');

// Audit spotr package
const spotrResult = auditAndFixPackage(
  'spotr',
  join(repoRoot, 'packages', 'spotr'),
  'spotr'
);
if (spotrResult) {
  results.push(spotrResult);
}

// Audit all examples
console.log('\n📚 Auditing examples...\n');
for (const framework of frameworks) {
  for (const exampleType of exampleTypes) {
    const exampleDir = join(repoRoot, 'examples', framework, exampleType);
    const exampleName = `${framework}/${exampleType}`;

    const exampleResult = auditAndFixPackage(
      exampleName,
      exampleDir,
      'example'
    );
    if (exampleResult) {
      results.push(exampleResult);
    }
  }
}

// Audit root and site (report-only)
console.log('\n🏠 Auditing workspace packages...\n');
const rootResult = auditAndFixPackage('root', repoRoot, 'root');
if (rootResult) {
  results.push(rootResult);
}

const siteResult = auditAndFixPackage('site', join(repoRoot, 'site'), 'site');
if (siteResult) {
  results.push(siteResult);
}

// Generate report
generateReport(results);

// Exit with appropriate code
const hasVulnerabilities = results.some(
  (r) => r.vulnerabilities.after.total > 0
);
const hasErrors = results.some((r) => r.errors.length > 0);

if (hasErrors) {
  process.exit(1);
} else if (hasVulnerabilities) {
  process.exit(1);
} else {
  process.exit(0);
}
