#!/usr/bin/env node

/**
 * HTML Entity Cleanup Script for TSX/JSX Files
 * 
 * This script finds and replaces unnecessary HTML entities in TSX/JSX files
 * with their proper character equivalents, since JSX handles these natively.
 */

import fs from 'fs';
import { glob } from 'glob';

// HTML entities that are unnecessary in JSX/TSX
const UNNECESSARY_ENTITIES: Record<string, string> = {
  '&apos;': "'",
  '&quot;': '"',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&lsquo;': "'",
  '&rsquo;': "'",
  '&hellip;': '...',
  '&mdash;': '—',
  '&ndash;': '–'
};

function cleanupFile(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    // Check for each unnecessary entity
    for (const [entity, replacement] of Object.entries(UNNECESSARY_ENTITIES)) {
      if (newContent.includes(entity)) {
        newContent = newContent.replace(new RegExp(entity, 'g'), replacement);
        modified = true;
        console.log(`  Replaced ${entity} with ${replacement}`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  console.log('🧼 HTML Entity Cleanup Script for TSX/JSX Files');
  console.log('===============================================\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  // Find all TSX and JSX files
  const files = glob.sync('**/*.{tsx,jsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**']
  });

  console.log(`Found ${files.length} TSX/JSX files to check\n`);

  let totalModified = 0;
  let totalEntitiesFound = 0;

  for (const file of files) {
    if (verbose) {
      console.log(`Checking: ${file}`);
    }

    try {
      const content = fs.readFileSync(file, 'utf8');
      let hasEntities = false;

      // Check if file contains any unnecessary entities
      for (const entity of Object.keys(UNNECESSARY_ENTITIES)) {
        if (content.includes(entity)) {
          hasEntities = true;
          break;
        }
      }

      if (hasEntities) {
        console.log(`\n📁 ${file}:`);
        
        if (!dryRun) {
          const modified = cleanupFile(file);
          if (modified) {
            totalModified++;
            console.log(`  ✅ Fixed`);
          }
        } else {
          // In dry run, just show what would be replaced
          for (const [entity, replacement] of Object.entries(UNNECESSARY_ENTITIES)) {
            const matches = (content.match(new RegExp(entity, 'g')) || []).length;
            if (matches > 0) {
              console.log(`  Would replace ${matches} instances of ${entity} with ${replacement}`);
              totalEntitiesFound += matches;
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error instanceof Error ? error.message : String(error));
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (dryRun) {
    console.log(`🔍 DRY RUN SUMMARY:`);
    console.log(`   Files with entities: ${totalModified}`);
    console.log(`   Total entities found: ${totalEntitiesFound}`);
    console.log(`\n   Run without --dry-run to apply changes`);
  } else {
    console.log(`✅ CLEANUP SUMMARY:`);
    console.log(`   Files modified: ${totalModified}`);
    console.log(`   Total entities replaced: ${totalEntitiesFound}`);
  }

  console.log('\n💡 Tips:');
  console.log('   - JSX/TSX handles quotes and apostrophes natively');
  console.log('   - Use regular quotes (") and apostrophes (\') directly');
  console.log('   - Only use HTML entities when absolutely necessary');
  console.log('   - Consider adding ESLint rules to prevent this in the future');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { cleanupFile, UNNECESSARY_ENTITIES };