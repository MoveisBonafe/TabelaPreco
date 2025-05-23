import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Product, Category, InsertProduct, InsertCategory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExcelImportExportProps {
  products: Product[];
  categories: Category[];
  onImportProducts: (products: InsertProduct[]) => void;
  onImportCategories: (categories: InsertCategory[]) => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  count?: number;
}

export function ExcelImportExport({ 
  products, 
  categories, 
  onImportProducts, 
  onImportCategories 
}: ExcelImportExportProps) {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Exportar produtos para Excel
  const exportProducts = () => {
    const exportData = products.map(product => ({
      Nome: product.name,
      Descrição: product.description,
      Categoria: product.category,
      'Preço Base': product.basePrice,
      'Desconto (%)': product.discount,
      'Preço Final': product.finalPrice,
      'Preço À Vista': product.priceAVista,
      'Preço 30 dias': product.price30,
      'Preço 30/60': product.price30_60,
      'Preço 30/60/90': product.price30_60_90,
      'Preço 30/60/90/120': product.price30_60_90_120,
      'URL da Imagem': product.image,
      Especificações: product.specifications?.join('; ') || '',
      Ativo: product.active ? 'Sim' : 'Não',
      'Data de Criação': product.createdAt.toLocaleDateString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos');

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 30 }, // Nome
      { wch: 50 }, // Descrição
      { wch: 15 }, // Categoria
      { wch: 12 }, // Preço Base
      { wch: 12 }, // Desconto
      { wch: 12 }, // Preço Final
      { wch: 40 }, // URL da Imagem
      { wch: 30 }, // Especificações
      { wch: 8 },  // Ativo
      { wch: 15 }  // Data de Criação
    ];
    ws['!cols'] = colWidths;

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `produtos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Exportar categorias para Excel
  const exportCategories = () => {
    const exportData = categories.map(category => ({
      Nome: category.name,
      Descrição: category.description,
      Ícone: category.icon,
      Cor: category.color,
      Ativo: category.active ? 'Sim' : 'Não',
      'Número de Produtos': category.productCount
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Categorias');

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 25 }, // Nome
      { wch: 50 }, // Descrição
      { wch: 20 }, // Ícone
      { wch: 10 }, // Cor
      { wch: 8 },  // Ativo
      { wch: 15 }  // Número de Produtos
    ];
    ws['!cols'] = colWidths;

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `categorias_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Processar arquivo Excel importado
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Usar a primeira planilha disponível
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      if (rawData.length === 0) {
        setImportResult({
          success: false,
          message: 'Arquivo Excel está vazio'
        });
        return;
      }

      const validProducts: InsertProduct[] = [];
      const errors: string[] = [];

      rawData.forEach((row: any, index) => {
        try {
          // Buscar apenas nome e preço - campos obrigatórios
          const name = row['Nome'] || row['nome'] || row['Name'] || row['NOME'] || row['Produto'] || '';
          const priceValue = row['Preço'] || row['preco'] || row['Price'] || row['PREÇO'] || row['Valor'];
          const price = parseFloat(String(priceValue).replace(',', '.')) || 0;

          // Debug: log da linha para identificar problemas
          console.log(`Linha ${index + 2}:`, { name, priceValue, price, row });

          // Validações simples - apenas nome e preço
          if (!name || !String(name).trim()) {
            errors.push(`Linha ${index + 2}: Nome é obrigatório (encontrado: "${name}")`);
            return;
          }

          if (!priceValue || price <= 0 || isNaN(price)) {
            errors.push(`Linha ${index + 2}: Preço inválido (encontrado: "${priceValue}")`);
            return;
          }

          // Criar produto com dados mínimos necessários
          const product: InsertProduct = {
            name: name.toString().trim(),
            description: '',
            category: 'Geral',
            basePrice: price,
            discount: 0,
            priceAVista: price,
            image: '',
            active: true,
            specifications: [],
            fixedPrice: false
          };

          validProducts.push(product);
        } catch (error) {
          errors.push(`Linha ${index + 2}: Erro ao processar dados`);
        }
      });

      if (errors.length > 0 && validProducts.length === 0) {
        setImportResult({
          success: false,
          message: `Erros encontrados:\n${errors.slice(0, 3).join('\n')}\n\nApenas 2 colunas são obrigatórias: Nome e Preço`
        });
        return;
      }

      if (validProducts.length > 0) {
        onImportProducts(validProducts);
        setImportResult({
          success: true,
          message: `${validProducts.length} produtos importados com sucesso!${errors.length > 0 ? ` (${errors.length} linhas ignoradas)` : ''}`,
          count: validProducts.length
        });
      } else {
        setImportResult({
          success: false,
          message: 'Nenhum produto válido encontrado. Certifique-se de que a planilha tem colunas: Nome e Preço'
        });
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      setImportResult({
        success: false,
        message: 'Erro ao processar arquivo Excel. Verifique se é um arquivo válido.'
      });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  // Importar produtos do Excel
  const importProductsFromExcel = async (workbook: XLSX.WorkBook) => {
    const worksheet = workbook.Sheets['Produtos'];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    const validProducts: InsertProduct[] = [];
    const errors: string[] = [];

    rawData.forEach((row: any, index) => {
      try {
        // Validar campos obrigatórios
        if (!row['Nome'] || !row['Categoria']) {
          errors.push(`Linha ${index + 2}: Nome e Categoria são obrigatórios`);
          return;
        }

        const basePrice = parseFloat(row['Preço Base']) || 0;
        const discount = parseFloat(row['Desconto (%)']) || 0;
        const priceAVista = parseFloat(row['Preço À Vista']) || 0;

        if (basePrice <= 0) {
          errors.push(`Linha ${index + 2}: Preço Base deve ser maior que zero`);
          return;
        }

        if (priceAVista <= 0) {
          errors.push(`Linha ${index + 2}: Preço À Vista deve ser maior que zero`);
          return;
        }

        const product: InsertProduct = {
          name: row['Nome'].toString().trim(),
          description: row['Descrição']?.toString().trim() || '',
          category: row['Categoria'].toString().trim(),
          basePrice: basePrice,
          discount: Math.max(0, Math.min(100, discount)), // Entre 0 e 100
          priceAVista: priceAVista,
          image: row['URL da Imagem']?.toString().trim() || '',
          specifications: row['Especificações'] 
            ? row['Especificações'].toString().split(';').map((s: string) => s.trim()).filter(Boolean)
            : [],
          active: row['Ativo']?.toString().toLowerCase() === 'sim',
          fixedPrice: false
        };

        validProducts.push(product);
      } catch (error) {
        errors.push(`Linha ${index + 2}: Erro ao processar dados`);
      }
    });

    if (errors.length > 0) {
      setImportResult({
        success: false,
        message: `Erros encontrados:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`
      });
      return;
    }

    if (validProducts.length === 0) {
      setImportResult({
        success: false,
        message: 'Nenhum produto válido encontrado no arquivo'
      });
      return;
    }

    // Importar produtos
    onImportProducts(validProducts);
    setImportResult({
      success: true,
      message: `${validProducts.length} produtos importados com sucesso!`,
      count: validProducts.length
    });
  };

  // Importar categorias do Excel
  const importCategoriesFromExcel = async (workbook: XLSX.WorkBook) => {
    const worksheet = workbook.Sheets['Categorias'];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    const validCategories: InsertCategory[] = [];
    const errors: string[] = [];

    rawData.forEach((row: any, index) => {
      try {
        if (!row['Nome']) {
          errors.push(`Linha ${index + 2}: Nome é obrigatório`);
          return;
        }

        const category: InsertCategory = {
          name: row['Nome'].toString().trim(),
          description: row['Descrição']?.toString().trim() || '',
          icon: row['Ícone']?.toString().trim() || 'fas fa-tag',
          color: row['Cor']?.toString().trim() || 'blue',
          active: row['Ativo']?.toString().toLowerCase() === 'sim'
        };

        validCategories.push(category);
      } catch (error) {
        errors.push(`Linha ${index + 2}: Erro ao processar dados`);
      }
    });

    if (errors.length > 0) {
      setImportResult({
        success: false,
        message: `Erros encontrados:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`
      });
      return;
    }

    if (validCategories.length === 0) {
      setImportResult({
        success: false,
        message: 'Nenhuma categoria válida encontrada no arquivo'
      });
      return;
    }

    // Importar categorias
    onImportCategories(validCategories);
    setImportResult({
      success: true,
      message: `${validCategories.length} categorias importadas com sucesso!`,
      count: validCategories.length
    });
  };

  // Baixar modelo de Excel
  const downloadTemplate = (type: 'products' | 'categories') => {
    let templateData: any[] = [];
    let sheetName = '';

    if (type === 'products') {
      templateData = [
        {
          'Nome': 'Mesa de Jantar',
          'Preço': 850.00
        },
        {
          'Nome': 'Cadeira Estofada',
          'Preço': 320.00
        },
        {
          'Nome': 'Sofá 3 Lugares',
          'Preço': 1200.00
        }
      ];
      sheetName = 'Modelo_Produtos';
    } else {
      templateData = [{
        'Nome': 'Exemplo Categoria',
        'Descrição': 'Descrição da categoria exemplo',
        'Ícone': 'fas fa-mobile-alt',
        'Cor': 'blue',
        'Ativo': 'Sim',
        'Número de Produtos': 0
      }];
      sheetName = 'Categorias';
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `modelo_${type === 'products' ? 'produtos' : 'categorias'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Importar/Exportar Excel</h2>
      
      {/* Resultado da importação */}
      {importResult && (
        <Alert className={importResult.success ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}>
          {importResult.success ? (
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={importResult.success ? 'text-emerald-800' : 'text-red-800'}>
            <pre className="whitespace-pre-wrap">{importResult.message}</pre>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exportar Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Exportar Dados
            </CardTitle>
            <CardDescription>
              Baixe os dados atuais em formato Excel para backup ou edição
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={exportProducts}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={products.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Produtos ({products.length})
            </Button>
            <Button 
              onClick={exportCategories}
              variant="outline"
              className="w-full"
              disabled={categories.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Categorias ({categories.length})
            </Button>
          </CardContent>
        </Card>

        {/* Importar Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              Importar Dados
            </CardTitle>
            <CardDescription>
              Carregue um arquivo Excel com produtos ou categorias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 mb-4">
                Selecione arquivo Excel com apenas 2 colunas: Nome e Preço
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileImport}
                className="mb-4 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                disabled={isProcessing}
              />
              {isProcessing && (
                <p className="text-emerald-600 font-medium">Processando arquivo...</p>
              )}
            </div>
            
            <div className="text-sm text-slate-600 space-y-3">
              <div>
                <p className="font-medium mb-2">📋 Como criar sua planilha:</p>
                <ul className="text-xs space-y-1 text-slate-600">
                  <li>• Coluna A: <strong>Nome</strong> (nome do produto)</li>
                  <li>• Coluna B: <strong>Preço</strong> (valor numérico)</li>
                  <li>• Use ponto ou vírgula para decimais (ex: 150.50 ou 150,50)</li>
                  <li>• Não use símbolos de moeda (R$, $)</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium mb-2">📥 Baixar modelo pronto:</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('products')}
                  className="w-full"
                >
                  📄 Baixar Modelo Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Para Produtos:</h4>
              <ul className="space-y-1">
                <li>• Nome e Categoria são obrigatórios</li>
                <li>• Preço Base deve ser maior que zero</li>
                <li>• Preço À Vista é obrigatório e deve ser maior que zero</li>
                <li>• Desconto deve estar entre 0 e 100%</li>
                <li>• Outras tabelas de preço são calculadas automaticamente</li>
                <li>• Especificações devem ser separadas por ponto e vírgula</li>
                <li>• Ativo: "Sim" ou "Não"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Para Categorias:</h4>
              <ul className="space-y-1">
                <li>• Nome é obrigatório</li>
                <li>• Ícone: classe Font Awesome (ex: fas fa-mobile-alt)</li>
                <li>• Cor: blue, purple, green, red, yellow, pink, indigo, gray</li>
                <li>• Ativo: "Sim" ou "Não"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}