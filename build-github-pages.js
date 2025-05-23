#!/usr/bin/env node

// Script para build do GitHub Pages na pasta docs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando build para GitHub Pages...');

try {
  // 1. Limpa a pasta docs se existir
  if (fs.existsSync('docs')) {
    fs.rmSync('docs', { recursive: true, force: true });
    console.log('✅ Pasta docs limpa');
  }

  // 2. Executa o build do Vite para a pasta docs
  console.log('📦 Executando build do Vite...');
  execSync('npx vite build --outDir docs --base ./', { stdio: 'inherit' });

  // 3. Cria arquivo .nojekyll para GitHub Pages
  fs.writeFileSync('docs/.nojekyll', '');
  console.log('✅ Arquivo .nojekyll criado');

  // 4. Cria arquivo 404.html que redireciona para index.html (SPA routing)
  const html404 = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catálogo de Produtos</title>
  <script>
    // Redireciona para index.html para funcionar como SPA
    window.location.replace('./index.html');
  </script>
</head>
<body>
  <p>Redirecionando...</p>
</body>
</html>`;

  fs.writeFileSync('docs/404.html', html404);
  console.log('✅ Arquivo 404.html criado');

  // 5. Verifica se os arquivos principais foram criados
  const requiredFiles = ['index.html', 'assets'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join('docs', file)));
  
  if (missingFiles.length > 0) {
    console.warn('⚠️  Arquivos ausentes:', missingFiles);
  } else {
    console.log('✅ Todos os arquivos necessários foram criados');
  }

  // 6. Mostra informações do build
  const stats = fs.statSync('docs');
  console.log('\n📊 Build concluído com sucesso!');
  console.log('📁 Pasta de destino: docs/');
  console.log('🌐 Pronto para GitHub Pages');
  console.log('\n🎯 Próximos passos:');
  console.log('1. Commit e push para o repositório');
  console.log('2. Configure GitHub Pages para usar a pasta "docs"');
  console.log('3. Acesse seu catálogo no GitHub Pages');

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}