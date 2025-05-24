#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando sincronização com GitHub...');

try {
  // Verificar se é um repositório git
  if (!fs.existsSync('.git')) {
    console.log('📁 Inicializando repositório Git...');
    execSync('git init', { stdio: 'inherit' });
  }

  // Adicionar todas as alterações
  console.log('📦 Adicionando arquivos alterados...');
  execSync('git add .', { stdio: 'inherit' });

  // Verificar se há mudanças para commit
  try {
    execSync('git diff --cached --exit-code', { stdio: 'pipe' });
    console.log('✅ Nenhuma alteração encontrada para sincronizar.');
    return;
  } catch (error) {
    // Há mudanças para commit
  }

  // Criar commit com timestamp
  const timestamp = new Date().toLocaleString('pt-BR');
  const commitMessage = `🔄 Sincronização automática - ${timestamp}`;
  
  console.log('💾 Criando commit...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  // Verificar se o remote origin existe
  try {
    execSync('git remote get-url origin', { stdio: 'pipe' });
  } catch (error) {
    console.log('⚠️  Remote origin não configurado.');
    console.log('Para configurar, execute:');
    console.log('git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git');
    return;
  }

  // Fazer push para o GitHub
  console.log('🌐 Enviando para GitHub...');
  try {
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Sincronização com GitHub concluída!');
    console.log('🎉 Suas alterações foram enviadas com sucesso!');
  } catch (error) {
    console.log('⚠️  Tentando push para master...');
    try {
      execSync('git push origin master', { stdio: 'inherit' });
      console.log('✅ Sincronização com GitHub concluída!');
    } catch (error2) {
      console.log('❌ Erro ao fazer push. Verifique suas credenciais do GitHub.');
      console.log('Configure um token de acesso ou SSH key para autenticação.');
    }
  }

} catch (error) {
  console.error('❌ Erro na sincronização:', error.message);
  console.log('💡 Verifique se o Git está configurado e você tem acesso ao repositório.');
}