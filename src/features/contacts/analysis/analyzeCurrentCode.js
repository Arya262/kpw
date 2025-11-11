/**
 * Code Analysis Script
 * Run this to analyze your current ContactList.jsx
 * 
 * Usage: node analyzeCurrentCode.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the ContactList file
const contactListPath = path.join(__dirname, '../ContactList.jsx');
const contactListCode = fs.readFileSync(contactListPath, 'utf-8');

// Analysis functions
const analyzeStateManagement = (code) => {
  const analysis = {
    useState: {
      count: (code.match(/useState\(/g) || []).length,
      declarations: [],
    },
    setState: {
      count: (code.match(/set[A-Z]\w+\(/g) || []).length,
      calls: [],
    },
    complexUpdates: {
      count: (code.match(/set\w+\(\s*\(?prev\)?/g) || []).length,
      examples: [],
    },
    stateGroups: {
      modals: 0,
      loading: 0,
      filters: 0,
      selection: 0,
      data: 0,
    },
  };

  // Extract useState declarations
  const useStateRegex = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\((.*?)\);/g;
  let match;
  while ((match = useStateRegex.exec(code)) !== null) {
    analysis.useState.declarations.push({
      variable: match[1],
      initialValue: match[2].trim(),
    });
  }

  // Extract setState calls
  const setStateRegex = /(set[A-Z]\w+)\(/g;
  const setStateCalls = new Set();
  while ((match = setStateRegex.exec(code)) !== null) {
    setStateCalls.add(match[1]);
  }
  analysis.setState.calls = Array.from(setStateCalls);

  // Extract complex updates (with prev)
  const complexUpdateRegex = /(set\w+)\(\s*\(?prev\)?.*?\)/g;
  while ((match = complexUpdateRegex.exec(code)) !== null) {
    const context = code.substring(Math.max(0, match.index - 50), match.index + 100);
    analysis.complexUpdates.examples.push({
      setter: match[1],
      context: context.replace(/\n/g, ' ').trim(),
    });
  }

  // Categorize state variables
  analysis.useState.declarations.forEach(({ variable }) => {
    const lower = variable.toLowerCase();
    if (lower.includes('modal') || lower.includes('dialog') || lower.includes('popup') || 
        lower.includes('show') || lower.includes('open')) {
      analysis.stateGroups.modals++;
    } else if (lower.includes('loading') || lower.includes('submitting')) {
      analysis.stateGroups.loading++;
    } else if (lower.includes('filter') || lower.includes('search')) {
      analysis.stateGroups.filters++;
    } else if (lower.includes('select') || lower.includes('checked')) {
      analysis.stateGroups.selection++;
    } else {
      analysis.stateGroups.data++;
    }
  });

  return analysis;
};

const calculateComplexityScore = (analysis) => {
  // Higher score = more complex
  const score = 
    (analysis.useState.count * 2) +
    (analysis.setState.count * 0.5) +
    (analysis.complexUpdates.count * 3);
  
  return {
    score: score.toFixed(1),
    rating: score > 100 ? 'Very High' : score > 50 ? 'High' : score > 25 ? 'Medium' : 'Low',
  };
};

const generateReport = (analysis) => {
  const complexity = calculateComplexityScore(analysis);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ContactList.jsx State Management Analysis');
  console.log('='.repeat(60) + '\n');

  console.log('📈 OVERVIEW');
  console.log('-'.repeat(60));
  console.log(`Total useState hooks:        ${analysis.useState.count}`);
  console.log(`Total setState calls:        ${analysis.setState.count}`);
  console.log(`Complex updates (with prev): ${analysis.complexUpdates.count}`);
  console.log(`Complexity Score:            ${complexity.score} (${complexity.rating})`);
  console.log('');

  console.log('🗂️  STATE CATEGORIZATION');
  console.log('-'.repeat(60));
  console.log(`Modal/Dialog states:  ${analysis.stateGroups.modals}`);
  console.log(`Loading states:       ${analysis.stateGroups.loading}`);
  console.log(`Filter states:        ${analysis.stateGroups.filters}`);
  console.log(`Selection states:     ${analysis.stateGroups.selection}`);
  console.log(`Data states:          ${analysis.stateGroups.data}`);
  console.log('');

  console.log('📝 STATE VARIABLES');
  console.log('-'.repeat(60));
  analysis.useState.declarations.forEach(({ variable, initialValue }, i) => {
    console.log(`${i + 1}. ${variable} = ${initialValue.substring(0, 50)}${initialValue.length > 50 ? '...' : ''}`);
  });
  console.log('');

  console.log('⚠️  COMPLEX UPDATE PATTERNS');
  console.log('-'.repeat(60));
  const uniqueComplexUpdates = analysis.complexUpdates.examples
    .filter((item, index, self) => 
      index === self.findIndex(t => t.setter === item.setter)
    )
    .slice(0, 5);
  
  uniqueComplexUpdates.forEach(({ setter, context }, i) => {
    console.log(`${i + 1}. ${setter}`);
    console.log(`   ${context.substring(0, 80)}...`);
    console.log('');
  });

  console.log('💡 RECOMMENDATIONS');
  console.log('-'.repeat(60));
  
  if (analysis.useState.count > 10) {
    console.log('✓ STRONGLY RECOMMENDED: Migrate to useReducer');
    console.log('  Reason: 10+ useState hooks indicate high complexity');
  }
  
  if (analysis.stateGroups.modals > 5) {
    console.log('✓ Group modal states into single reducer state');
    console.log(`  Found ${analysis.stateGroups.modals} modal-related states`);
  }
  
  if (analysis.complexUpdates.count > 10) {
    console.log('✓ Simplify state updates with reducer actions');
    console.log(`  Found ${analysis.complexUpdates.count} complex updates with prev pattern`);
  }

  console.log('');
  console.log('📊 ESTIMATED IMPROVEMENTS WITH useReducer');
  console.log('-'.repeat(60));
  console.log(`State hooks:      ${analysis.useState.count} → 1 (${((1 - 1/analysis.useState.count) * 100).toFixed(0)}% reduction)`);
  console.log(`Complexity score: ${complexity.score} → ~${(complexity.score * 0.3).toFixed(1)} (${((1 - 0.3) * 100).toFixed(0)}% reduction)`);
  console.log(`Maintainability:  Low → High`);
  console.log(`Testability:      Difficult → Easy`);
  console.log(`Bug risk:         High → Low`);
  console.log('');

  console.log('🎯 MIGRATION PRIORITY');
  console.log('-'.repeat(60));
  console.log('1. Modal states (highest impact, easiest to migrate)');
  console.log('2. Loading states (simple boolean flags)');
  console.log('3. Selection logic (already complex)');
  console.log('4. Filter options (most complex, migrate last)');
  console.log('');

  console.log('='.repeat(60));
  console.log('Analysis complete! ✨');
  console.log('='.repeat(60) + '\n');
};

// Run analysis
try {
  const analysis = analyzeStateManagement(contactListCode);
  generateReport(analysis);
  
  // Save detailed report to file
  const reportPath = path.join(__dirname, 'analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
} catch (error) {
  console.error('Error analyzing code:', error.message);
  process.exit(1);
}
