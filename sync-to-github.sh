#!/bin/bash

echo "🚀 Sincronizando com GitHub..."

# Adicionar todas as alterações
git add .

# Verificar se há mudanças
if git diff --cached --exit-code > /dev/null 2>&1; then
    echo "✅ Nenhuma alteração encontrada para sincronizar."
    exit 0
fi

# Criar commit com timestamp
TIMESTAMP=$(date '+%d/%m/%Y %H:%M:%S')
git commit -m "🔄 Sincronização automática - $TIMESTAMP"

# Fazer push para o GitHub
echo "🌐 Enviando para GitHub..."
if git push origin main 2>/dev/null || git push origin master 2>/dev/null; then
    echo "✅ Sincronização concluída com sucesso!"
    echo "🎉 Suas alterações foram enviadas para o GitHub!"
else
    echo "❌ Erro ao sincronizar. Verifique se o repositório GitHub está configurado."
    echo "💡 Para configurar, execute: git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git"
fi