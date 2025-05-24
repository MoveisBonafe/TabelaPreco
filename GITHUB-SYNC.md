# 🔄 Sincronização Automática com GitHub

## Como Configurar

### 1. Primeiro Setup (uma vez só)
```bash
# Inicializar Git (se ainda não foi feito)
git init

# Conectar ao seu repositório GitHub
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# Configurar usuário (se ainda não foi feito)
git config user.name "Seu Nome"
git config user.email "seu-email@example.com"
```

### 2. Sincronizar Mudanças
```bash
# Executar sincronização manual
./sync-to-github.sh
```

### 3. Deploy Automático
O arquivo `.github/workflows/deploy.yml` já está configurado para:
- ✅ Deploy automático quando você fizer push
- ✅ Build otimizado para GitHub Pages
- ✅ Configuração de Supabase automática

### 4. Configurar Secrets no GitHub
No seu repositório GitHub, vá em Settings > Secrets and variables > Actions e adicione:

- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave pública do Supabase

### 5. Ativar GitHub Pages
1. Vá em Settings > Pages
2. Source: GitHub Actions
3. Salvar

## ✨ Resultado
Toda vez que você executar `./sync-to-github.sh`, suas alterações serão:
1. 📦 Commitadas automaticamente
2. 🌐 Enviadas para o GitHub
3. 🚀 Deployadas automaticamente no GitHub Pages
4. ✅ Disponíveis em: `https://SEU-USUARIO.github.io/SEU-REPOSITORIO`

## 🎯 Comando Rápido
```bash
./sync-to-github.sh
```

Pronto! Suas alterações estarão online em poucos minutos!