#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PackageUsage {
  packageName: string;
  isUsed: boolean;
  importCount: number;
  locations: string[];
}

interface AnalysisReport {
  totalPackages: number;
  usedPackages: number;
  unusedPackages: number;
  packages: PackageUsage[];
  unusedList: string[];
}

function readPackageJson(): any {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
}

function searchForImports(packageName: string): { count: number; locations: string[] } {
  const patterns = [
    `from ['"]${packageName}['"]`,
    `from ['"]${packageName}/`,
    `require\\(['"]${packageName}['"]\\)`,
    `require\\(['"]${packageName}/`,
    `import\\(['"]${packageName}['"]\\)`,
    `import\\(['"]${packageName}/`
  ];

  let totalCount = 0;
  const locations: string[] = [];

  for (const pattern of patterns) {
    try {
      // Use PowerShell's Select-String for Windows
      const command = `powershell -Command "Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx -Recurse -File | Where-Object { $_.FullName -notmatch 'node_modules|.next|dist|build' } | Select-String -Pattern '${pattern}' | Select-Object -First 10"`;
      
      const result = execSync(command, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });

      if (result.trim()) {
        const lines = result.trim().split('\n');
        totalCount += lines.length;
        locations.push(...lines.slice(0, 5).map(line => line.trim()));
      }
    } catch (error) {
      // No matches found or error - continue
    }
  }

  return { count: totalCount, locations: locations.slice(0, 5) };
}

function analyzePackages(): AnalysisReport {
  const packageJson = readPackageJson();
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const packages: PackageUsage[] = [];
  const unusedList: string[] = [];

  console.log('Analyzing package usage...\n');

  for (const [packageName, version] of Object.entries(allDeps)) {
    process.stdout.write(`Checking ${packageName}...`);
    
    const { count, locations } = searchForImports(packageName);
    const isUsed = count > 0;

    packages.push({
      packageName,
      isUsed,
      importCount: count,
      locations
    });

    if (!isUsed) {
      unusedList.push(packageName);
    }

    console.log(isUsed ? ` ✓ (${count} imports)` : ' ✗ (unused)');
  }

  return {
    totalPackages: packages.length,
    usedPackages: packages.filter(p => p.isUsed).length,
    unusedPackages: unusedList.length,
    packages,
    unusedList
  };
}

function generateReport(report: AnalysisReport): void {
  const reportPath = path.join(process.cwd(), 'PACKAGE_USAGE_REPORT.md');
  
  let content = `# Package Usage Analysis Report\n\n`;
  content += `**Generated:** ${new Date().toISOString()}\n\n`;
  content += `## Summary\n\n`;
  content += `- **Total Packages:** ${report.totalPackages}\n`;
  content += `- **Used Packages:** ${report.usedPackages}\n`;
  content += `- **Unused Packages:** ${report.unusedPackages}\n`;
  content += `- **Usage Rate:** ${((report.usedPackages / report.totalPackages) * 100).toFixed(1)}%\n\n`;

  content += `## Unused Packages (${report.unusedPackages})\n\n`;
  content += `These packages have zero imports in the codebase:\n\n`;
  
  report.unusedList.forEach(pkg => {
    content += `- \`${pkg}\`\n`;
  });

  content += `\n## Detailed Analysis\n\n`;
  
  const unusedPackages = report.packages.filter(p => !p.isUsed);
  unusedPackages.forEach(pkg => {
    content += `### ${pkg.packageName}\n`;
    content += `- **Status:** ❌ Unused\n`;
    content += `- **Import Count:** 0\n\n`;
  });

  const usedPackages = report.packages.filter(p => p.isUsed);
  content += `\n## Used Packages (${usedPackages.length})\n\n`;
  usedPackages.forEach(pkg => {
    content += `- \`${pkg.packageName}\` - ${pkg.importCount} imports\n`;
  });

  fs.writeFileSync(reportPath, content);
  console.log(`\n✓ Report generated: ${reportPath}`);
}

// Run analysis
const report = analyzePackages();
generateReport(report);

console.log(`\n=== Analysis Complete ===`);
console.log(`Found ${report.unusedPackages} unused packages out of ${report.totalPackages} total`);
