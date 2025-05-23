# Catálogo de Produtos - Móveis Bonafé

Um catálogo de produtos moderno e responsivo com sistema de login diferenciado e painel administrativo, otimizado para diferentes tipos de usuário.

## 🚀 Características

- **Interface Moderna**: Design responsivo e intuitivo
- **Sistema de Autenticação**: Login com diferentes níveis de acesso
- **Gestão de Produtos**: CRUD completo com múltiplas imagens
- **Tabelas de Preços**: Sistema flexível de preços com multiplicadores
- **Importação Excel**: Suporte para importação simplificada de produtos
- **Preços Fixos**: Opção para produtos com preços não afetados por multiplicadores
- **Responsivo**: Otimizado para desktop, tablet e mobile

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Armazenamento**: LocalStorage (pode ser migrado para PostgreSQL)
- **Roteamento**: Wouter
- **Formulários**: React Hook Form + Zod

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/catalogo-produtos.git
cd catalogo-produtos
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5000`

## 👥 Usuários de Teste

### Administrador
- **Usuário**: `MoveisBonafe`
- **Senha**: `Bonafe1108`
- **Permissões**: Acesso completo ao sistema

### Loja
- **Usuário**: `Loja`
- **Senha**: `Bonafe1108`
- **Permissões**: Visualização de produtos e preços

## 📊 Funcionalidades

### Painel Administrativo
- ✅ Gestão de produtos (criar, editar, excluir)
- ✅ Gestão de categorias
- ✅ Controle de preços e tabelas
- ✅ Gestão de usuários e permissões
- ✅ Importação/exportação via Excel

### Catálogo Público
- ✅ Visualização de produtos por categoria
- ✅ Busca e filtros
- ✅ Visualização de preços baseada no usuário
- ✅ Galeria de imagens
- ✅ Layout responsivo

### Sistema de Preços
- ✅ Preço à vista
- ✅ Tabelas de parcelamento (30, 30/60, 30/60/90, 30/60/90/120 dias)
- ✅ Multiplicadores por usuário
- ✅ Opção de preços fixos

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilitários e configurações
│   │   ├── pages/          # Páginas da aplicação
│   │   └── ...
├── server/                 # Backend Express
├── shared/                 # Tipos e schemas compartilhados
└── ...
```

## 🚀 Deploy

O projeto está configurado para deploy fácil em:
- **Replit**: Deploy automático
- **Vercel**: Frontend estático
- **Railway/Render**: Fullstack com banco

### Para GitHub Pages (Frontend apenas):
1. Build o projeto: `npm run build`
2. Configure o repositório para GitHub Pages
3. Faça deploy da pasta `dist`

## 📋 Roadmap

- [ ] Migração para banco de dados PostgreSQL
- [ ] Sistema de autenticação OAuth
- [ ] API REST completa
- [ ] Dashboards e relatórios
- [ ] Notificações em tempo real
- [ ] PWA (Progressive Web App)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

Móveis Bonafé - contato@moveisbonafe.com

Link do Projeto: [https://github.com/seu-usuario/catalogo-produtos](https://github.com/seu-usuario/catalogo-produtos)