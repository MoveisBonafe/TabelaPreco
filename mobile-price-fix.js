// Função para renderizar todas as tabelas de preços no mobile
function renderAllPriceTables(priceTable) {
  const allTables = Object.entries(priceTable);
  
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 0.3rem; font-size: 0.7rem;">
      ${allTables.map(([tableName, price]) => `
        <div style="padding: 0.3rem; background: ${tableName === 'A Vista' ? '#f0fdf4' : '#eff6ff'}; 
                    border-radius: 0.25rem; text-align: center; 
                    border-left: 3px solid ${tableName === 'A Vista' ? '#10b981' : '#3b82f6'};">
          <div style="color: #6b7280; font-size: 0.55rem; margin-bottom: 0.2rem; font-weight: 500; line-height: 1;">
            ${tableName}
          </div>
          <div style="color: ${tableName === 'A Vista' ? '#10b981' : '#3b82f6'}; font-weight: 600; font-size: 0.7rem;">
            R$ ${price.toFixed(2)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Aplicar fix no arquivo principal
console.log('Fix para mobile criado - aplicar no arquivo principal');