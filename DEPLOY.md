# 🚀 Guia de Deploy - Catálogo de Produtos

Este guia mostra como fazer deploy do projeto em diferentes plataformas.

## 📋 Preparação

Antes de fazer o deploy, certifique-se de que:
- ✅ O projeto está funcionando localmente
- ✅ Todos os arquivos estão commitados
- ✅ O build está funcionando: `npm run build`

## 🌐 Deploy no GitHub Pages (Frontend apenas)

### Configuração Automática
1. Faça push do código para o GitHub
2. Vá em **Settings** > **Pages** no seu repositório
3. Configure **Source** para **GitHub Actions**
4. O deploy automático será executado a cada push na branch `main`

### Configuração Manual
```bash
# Build do projeto
npm run build

# Deploy manual (se necessário)
gh-pages -d dist
```

## ☁️ Deploy Full-Stack

### Vercel (Recomendado)
1. Conecte seu repositório GitHub no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente se necessário
3. Deploy automático a cada commit

### Railway
1. Conecte no [Railway](https://railway.app)
2. Importe seu repositório GitHub
3. Adicione PostgreSQL se necessário
4. Configure variáveis de ambiente

### Render
1. Conecte no [Render](https://render.com)
2. Crie um novo Web Service
3. Configure build command: `npm install && npm run build`
4. Configure start command: `npm start`

## 🔧 Variáveis de Ambiente

Para deploy full-stack, configure:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=sua-url-do-banco
SESSION_SECRET=sua-chave-secreta
```

## 📦 Build para Produção

```bash
# Instalar dependências
npm install

# Build do projeto
npm run build

# Preview local da build
npm run preview
```

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:
- ✅ Login funciona (MoveisBonafe/Bonafe1108)
- ✅ Produtos são exibidos corretamente
- ✅ Upload de imagens funciona
- ✅ Tabelas de preços calculam corretamente
- ✅ Responsive design no mobile

## 🐛 Troubleshooting

### Problemas Comuns
- **404 no refresh**: Configure redirects para SPA
- **CORS errors**: Configure CORS no backend
- **Build falha**: Verifique TypeScript errors
- **Imagens não carregam**: Verifique URLs das imagens

### Logs Úteis
```bash
# Verificar build local
npm run build

# Verificar erros TypeScript
npx tsc --noEmit

# Verificar linting
npm run lint
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de deploy
2. Teste localmente primeiro
3. Verifique a documentação da plataforma
4. Entre em contato para suporte