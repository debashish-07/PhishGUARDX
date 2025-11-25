const { execSync } = require('child_process');

console.log('🧪 Running all tests...\n');

try {
  console.log('1️⃣ Running unit tests...');
  execSync('npm test', { stdio: 'inherit' });
  
  console.log('\n2️⃣ Running component tests...');
  execSync('npm test -- __tests__/components.test.tsx', { stdio: 'inherit' });
  
  console.log('\n3️⃣ Running E2E tests...');
  execSync('npm run test:e2e', { stdio: 'inherit' });
  
  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('\n❌ Tests failed!');
  process.exit(1);
}
