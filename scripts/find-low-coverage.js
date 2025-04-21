/**
 * Script to identify files with low test coverage
 * 
 * This script parses the Jest coverage report and identifies files 
 * that need additional test coverage, sorted by priority.
 * 
 * Usage: node scripts/find-low-coverage.js [threshold]
 * Where threshold is an optional percentage (default: 80)
 */

const fs = require('fs');
const path = require('path');

// Default threshold - files below this percentage are considered low coverage
const DEFAULT_THRESHOLD = 80;

// Get threshold from command line arguments or use default
const threshold = process.argv[2] ? parseInt(process.argv[2], 10) : DEFAULT_THRESHOLD;

// Path to the coverage summary
const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');

try {
  // Check if coverage file exists
  if (!fs.existsSync(coveragePath)) {
    console.error('Coverage report not found. Run "npm run test:coverage" first.');
    process.exit(1);
  }

  // Read and parse the coverage summary
  const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  
  // Get total coverage
  const total = coverageData.total;
  
  console.log(`\n======= OVERALL COVERAGE SUMMARY =======`);
  console.log(`Statements: ${total.statements.pct.toFixed(2)}%`);
  console.log(`Branches  : ${total.branches.pct.toFixed(2)}%`);
  console.log(`Functions : ${total.functions.pct.toFixed(2)}%`);
  console.log(`Lines     : ${total.lines.pct.toFixed(2)}%`);
  
  // Files with coverage below threshold
  const lowCoverageFiles = [];
  
  // Process each file
  for (const filePath in coverageData) {
    if (filePath === 'total') continue;
    
    const file = coverageData[filePath];
    
    // Calculate average coverage for the file
    const avgCoverage = (
      file.statements.pct + 
      file.branches.pct + 
      file.functions.pct + 
      file.lines.pct
    ) / 4;
    
    // Check if any metric is below threshold
    if (
      file.statements.pct < threshold ||
      file.branches.pct < threshold ||
      file.functions.pct < threshold ||
      file.lines.pct < threshold
    ) {
      lowCoverageFiles.push({
        path: filePath,
        statements: file.statements.pct,
        branches: file.branches.pct,
        functions: file.functions.pct,
        lines: file.lines.pct,
        average: avgCoverage,
        missingStatements: file.statements.total - file.statements.covered,
        missingBranches: file.branches.total - file.branches.covered,
        missingFunctions: file.functions.total - file.functions.covered,
        missingLines: file.lines.total - file.lines.covered,
        priority: (threshold - avgCoverage) * (
          (file.statements.total - file.statements.covered) +
          (file.branches.total - file.branches.covered) +
          (file.functions.total - file.functions.covered) +
          (file.lines.total - file.lines.covered)
        )
      });
    }
  }
  
  // Sort by priority (highest first)
  lowCoverageFiles.sort((a, b) => b.priority - a.priority);
  
  // Print results
  console.log(`\n======= ${lowCoverageFiles.length} FILES BELOW ${threshold}% COVERAGE =======`);
  
  lowCoverageFiles.forEach((file, index) => {
    console.log(`\n${index + 1}. ${file.path}`);
    console.log(`   Statements: ${file.statements.toFixed(2)}% (missing ${file.missingStatements})`);
    console.log(`   Branches  : ${file.branches.toFixed(2)}% (missing ${file.missingBranches})`);
    console.log(`   Functions : ${file.functions.toFixed(2)}% (missing ${file.missingFunctions})`);
    console.log(`   Lines     : ${file.lines.toFixed(2)}% (missing ${file.missingLines})`);
    console.log(`   Average   : ${file.average.toFixed(2)}%`);
    console.log(`   Priority  : ${file.priority.toFixed(2)}`);
  });
  
  // Provide summary and recommendations
  console.log(`\n======= RECOMMENDATIONS =======`);
  if (lowCoverageFiles.length > 0) {
    console.log(`1. Focus first on the top ${Math.min(5, lowCoverageFiles.length)} files with highest priority.`);
    console.log(`2. Start with files that have the most missing functions, as these are often easiest to test.`);
    console.log(`3. Then tackle branch coverage, which ensures all decision paths are tested.`);
    console.log(`4. Finally, address statement and line coverage to catch any remaining gaps.`);
    
    // List top 5 files to focus on
    console.log(`\nTop ${Math.min(5, lowCoverageFiles.length)} files to focus on:`);
    lowCoverageFiles.slice(0, 5).forEach((file, index) => {
      console.log(`${index + 1}. ${file.path}`);
    });
  } else {
    console.log(`Great job! All files have coverage of at least ${threshold}%.`);
  }
  
} catch (error) {
  console.error('Error parsing coverage data:', error);
  process.exit(1);
}
