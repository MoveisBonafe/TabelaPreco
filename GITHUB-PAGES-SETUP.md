# 🚀 Configuração do GitHub Pages

Este guia mostra como configurar seu catálogo de produtos para funcionar perfeitamente no GitHub Pages usando a pasta `docs`.

## 📋 Passos para Deploy

### 1. Gerar Build para GitHub Pages
```bash
node build-github-pages.js
```

Este comando irá:
- ✅ Criar a pasta `docs` com todos os arquivos necessários
- ✅ Configurar os caminhos relativos para GitHub Pages
- ✅ Adicionar arquivo `.nojekyll` para compatibilidade
- ✅ Criar arquivo `404.html` para roteamento SPA

### 2. Configurar GitHub Pages

1. **Faça push** dos arquivos para seu repositório:
   ```bash
   git add docs/
   git commit -m "Deploy para GitHub Pages"
   git push origin main
   ```

2. **No GitHub**, vá para seu repositório
3. Clique em **Settings** (Configurações)
4. Role até a seção **Pages**
5. Em **Source**, selecione **Deploy from a branch**
6. Em **Branch**, selecione **main**
7. Em **Folder**, selecione **/ docs**
8. Clique em **Save**

### 3. Acessar seu Catálogo

Após alguns minutos, seu catálogo estará disponível em:
```
https://SEU-USUARIO.github.io/SEU-REPOSITORIO
```

## 🎯 Funcionalidades no GitHub Pages

✅ **Sistema Offline** - Funciona sem backend  
✅ **LocalStorage** - Dados salvos no navegador  
✅ **Sincronização** - Entre abas do mesmo navegador  
✅ **Import/Export Excel** - Funcionalidade completa  
✅ **Monitor de Storage** - Aba "Monitor DB" funcional  
✅ **Backup Local** - Export de dados em JSON  

## 📱 Compatibilidade

- ✅ **Desktop** - Chrome, Firefox, Safari, Edge
- ✅ **Mobile** - Navegadores móveis modernos
- ✅ **Tablets** - Interface responsiva completa

## 🔧 Atualizações

Para atualizar o site:
1. Faça suas alterações no código
2. Execute: `node build-github-pages.js`
3. Commit e push da pasta `docs`
4. GitHub Pages atualizará automaticamente

## ⚠️ Importante

- Os dados ficam **salvos no navegador** de cada usuário
- Para **dados compartilhados**, configure o Supabase
- Cada usuário terá seu **próprio catálogo local**
- Use a funcionalidade de **backup** regularmente

## 🎉 Pronto!

Seu catálogo de produtos inteligente agora funciona perfeitamente no GitHub Pages com todas as funcionalidades ativas!