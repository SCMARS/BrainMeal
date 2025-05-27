#!/usr/bin/env node

/**
 * Build Check Script
 * Проверяет готовность проекта к деплою
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔍 Checking project for deployment readiness...\n');

const checks = [];

// Проверка наличия необходимых файлов
const requiredFiles = [
    'package.json',
    'vite.config.js',
    '.env.example',
    '.gitignore',
    'README.md',
    'index.html'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    checks.push({ name: `Required file: ${file}`, passed: exists });
});

// Проверка package.json
console.log('\n📦 Checking package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    
    const hasName = !!packageJson.name;
    const hasVersion = !!packageJson.version;
    const hasBuildScript = !!packageJson.scripts?.build;
    const hasPreviewScript = !!packageJson.scripts?.preview;
    
    console.log(`  ${hasName ? '✅' : '❌'} Has name`);
    console.log(`  ${hasVersion ? '✅' : '❌'} Has version`);
    console.log(`  ${hasBuildScript ? '✅' : '❌'} Has build script`);
    console.log(`  ${hasPreviewScript ? '✅' : '❌'} Has preview script`);
    
    checks.push(
        { name: 'Package name', passed: hasName },
        { name: 'Package version', passed: hasVersion },
        { name: 'Build script', passed: hasBuildScript },
        { name: 'Preview script', passed: hasPreviewScript }
    );
} catch (error) {
    console.log('  ❌ Invalid package.json');
    checks.push({ name: 'Valid package.json', passed: false });
}

// Проверка структуры проекта
console.log('\n🏗️ Checking project structure...');
const requiredDirs = [
    'src',
    'src/components',
    'src/pages',
    'src/context',
    'src/services'
];

requiredDirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    const exists = fs.existsSync(dirPath);
    console.log(`  ${exists ? '✅' : '❌'} ${dir}/`);
    checks.push({ name: `Directory: ${dir}`, passed: exists });
});

// Проверка основных компонентов
console.log('\n⚛️ Checking main components...');
const mainFiles = [
    'src/App.jsx',
    'src/main.jsx',
    'src/firebase.js',
    'src/context/AuthContext.jsx',
    'src/context/LanguageContext.jsx'
];

mainFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    checks.push({ name: `Main file: ${file}`, passed: exists });
});

// Проверка .env.example
console.log('\n🔐 Checking environment configuration...');
try {
    const envExample = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf8');
    const hasFirebaseConfig = envExample.includes('VITE_FIREBASE_API_KEY');
    const hasStripeConfig = envExample.includes('VITE_STRIPE_PUBLISHABLE_KEY');
    const hasGeminiConfig = envExample.includes('VITE_GEMINI_API_KEY');
    
    console.log(`  ${hasFirebaseConfig ? '✅' : '❌'} Firebase configuration`);
    console.log(`  ${hasStripeConfig ? '✅' : '❌'} Stripe configuration`);
    console.log(`  ${hasGeminiConfig ? '✅' : '❌'} Gemini AI configuration`);
    
    checks.push(
        { name: 'Firebase env vars', passed: hasFirebaseConfig },
        { name: 'Stripe env vars', passed: hasStripeConfig },
        { name: 'Gemini env vars', passed: hasGeminiConfig }
    );
} catch (error) {
    console.log('  ❌ Cannot read .env.example');
    checks.push({ name: '.env.example readable', passed: false });
}

// Итоговый отчет
console.log('\n📊 Summary:');
const passed = checks.filter(check => check.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`  ✅ Passed: ${passed}/${total} (${percentage}%)`);

if (percentage === 100) {
    console.log('\n🎉 Project is ready for deployment!');
    console.log('\nNext steps:');
    console.log('1. Set up your environment variables');
    console.log('2. Run: npm run build');
    console.log('3. Test: npm run preview');
    console.log('4. Deploy to your hosting platform');
} else {
    console.log('\n⚠️ Project needs attention before deployment.');
    console.log('\nFailed checks:');
    checks.filter(check => !check.passed).forEach(check => {
        console.log(`  ❌ ${check.name}`);
    });
}

console.log('\n🔗 Useful commands:');
console.log('  npm run build     - Build for production');
console.log('  npm run preview   - Preview production build');
console.log('  npm run dev       - Start development server');

process.exit(percentage === 100 ? 0 : 1);
