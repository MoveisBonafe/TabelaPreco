# 🚀 Deploy MoveisBonafe no GitHub Pages

## ✅ Sistema Completo para GitHub Pages

Seu sistema está configurado para administração completa diretamente no GitHub Pages!

### 🎯 O que você terá no GitHub Pages:

**✅ PAINEL ADMINISTRATIVO COMPLETO:**
- Login com usuário/senha
- Cadastro de produtos com todos os preços
- Gerenciamento de categorias  
- Importação de planilhas Excel
- Sistema de backup
- Aba de monitoramento

**✅ CATÁLOGO PÚBLICO:**
- Interface profissional para clientes
- Visualização responsiva
- Sistema de busca e filtros

**✅ DADOS SALVOS NO SUPABASE:**
- Persistência permanente na nuvem
- Sincronização automática
- Acesso de qualquer lugar

## 📋 Passos para deploy:

### 1. Configurar Secrets do Supabase no GitHub:
- Vá para Settings > Secrets and variables > Actions no seu repositório
- Clique em "New repository secret"
- Adicione os secrets:
  - **Nome:** `VITE_SUPABASE_URL`
  - **Valor:** `https://oozesebwtrbzeelkcmwp.supabase.co`
- Clique em "New repository secret" novamente
- Adicione:
  - **Nome:** `VITE_SUPABASE_ANON_KEY`
  - **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNDI4ODAsImV4cCI6MjA2MzYxODg4MH0.B7r5fxV2mCvQ0GQUk-oEEXsPlYdJTHhQ8KH8zwEWMn8`

### 2. Configurar GitHub Pages:
- Vá para Settings > Pages no seu repositório
- Source: "GitHub Actions"

### 3. Fazer commit das alterações:
```bash
git add .
git commit -m "Configurar sistema completo para GitHub Pages"
git push origin main
```

### 4. Aguardar deploy automático:
- O GitHub Actions irá fazer o build automaticamente
- Seu site ficará disponível em: `https://seuusuario.github.io/TabelaPreco/`

## 🔐 Credenciais de administração:
- **Usuário:** admin
- **Senha:** admin123

## 🎉 Resultado final:
Você terá um sistema completo de administração funcionando diretamente no GitHub Pages, conectado ao seu banco Supabase, sem necessidade de servidor!