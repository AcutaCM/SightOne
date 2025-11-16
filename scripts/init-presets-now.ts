import { getDefaultPresetAssistantsService } from '../lib/services/presetAssistantsService';

async function main() {
  console.log('🚀 Starting preset assistants initialization...\n');
  
  const service = getDefaultPresetAssistantsService();
  const result = await service.initializeAllPresets();
  
  console.log('\n=== Initialization Results ===');
  console.log(`Created: ${result.created}`);
  console.log(`Updated: ${result.updated}`);
  console.log(`Skipped: ${result.skipped}`);
  
  if (result.errors.length > 0) {
    console.log(`\nErrors (${result.errors.length}):`);
    result.errors.forEach(error => console.log(`  - ${error}`));
    process.exit(1);
  } else {
    console.log('\n✅ All preset assistants initialized successfully!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
