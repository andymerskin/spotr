import { execSync } from 'child_process';
import { readFileSync } from 'fs';

export interface Vulnerability {
  name: string;
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
  via: Array<{ name: string; range: string }>;
  effects: string[];
  title: string;
  url: string;
}

export interface AuditResult {
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

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface OutdatedPackage {
  current: string;
  wanted: string;
  latest: string;
  location: string;
  dependent?: string;
  type?: string;
}

export interface OutdatedResult {
  [packageName: string]: OutdatedPackage;
}

/**
 * Run npm audit and parse JSON output
 */
export function runAudit(packageDir: string): AuditResult | null {
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

/**
 * Check for outdated packages using npm outdated
 */
export function checkOutdatedPackages(
  packageDir: string
): OutdatedResult | null {
  try {
    const output = execSync('npm outdated --json', {
      cwd: packageDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return JSON.parse(output) as OutdatedResult;
  } catch (error: unknown) {
    // npm outdated exits with non-zero if outdated packages exist
    try {
      const errorObj = error as { stdout?: string; message?: string };
      const output = errorObj.stdout || errorObj.message || '';
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as OutdatedResult;
      }
    } catch {
      // If no outdated packages, npm outdated exits with code 1 but no JSON
      // Return empty object to indicate no outdated packages
      return {};
    }
    return null;
  }
}

/**
 * Get current version from package.json
 */
export function getCurrentVersion(
  packageJson: PackageJson,
  packageName: string
): string | null {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  return deps[packageName] || null;
}

/**
 * Check if an update is safe (patch/minor only, same major version)
 */
export function canUpdateSafely(
  currentRange: string,
  newVersion: string
): boolean {
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

/**
 * Update package.json with new version (in-memory only)
 */
export function updatePackageVersion(
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

/**
 * Get latest version for a package within the same major version
 */
export function getLatestVersion(
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

/**
 * Check if a dependency is a workspace protocol dependency
 */
export function isWorkspaceDependency(version: string): boolean {
  return version.startsWith('workspace:');
}
