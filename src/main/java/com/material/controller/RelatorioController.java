package com.material.controller;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.material.model.Produto;
import com.material.model.Entrada;
import com.material.model.EntradaImpostos;
import com.material.model.EntradaProdutos; 
import com.material.model.OrigemSistema;
import com.material.repository.ProdutoRepository;
import com.material.repository.EntradaRepository;
import com.material.repository.OrigemSistemaRepository;
import com.material.repository.EntradaImpostosRepository;
import com.material.repository.EntradaProdutosRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.awt.Color;
import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {
	
    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private EntradaRepository entradaRepository;

    @Autowired
    private EntradaImpostosRepository impostosRepository; 

    @Autowired
    private EntradaProdutosRepository entradaProdutosRepository;
    
    @Autowired
    private OrigemSistemaRepository origemSistemaRepository;
    
    // ==========================================================
    // 🌳 ENDPOINT 1: MAPA DE INVENTÁRIO DE MERCADORIAS (MIM)
    // ==========================================================
    @GetMapping("/mim")
    public ResponseEntity<byte[]> gerarMim() {
        try {
            List<Produto> produtos = produtoRepository.findAll();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 20, 20, 20, 20);
            PdfWriter.getInstance(document, out);

            document.open();

            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.DARK_GRAY);
            Paragraph titulo = new Paragraph("🌳 MIM - MAPA DE INVENTÁRIO DE MERCADORIAS", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            document.add(titulo);

            // Definição exata de larguras para as colunas do inventário
            PdfPTable table = new PdfPTable(new float[]{10f, 40f, 15f, 15f, 20f});
            table.setWidthPercentage(100);

            Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            String[] headers = {"ID", "PRODUTO", "SALDO ESTOQUE", "PREÇO CUSTO", "VALOR TOTAL"};
            
            for (int i = 0; i < headers.length; i++) {
                PdfPCell cell = new PdfPCell(new Phrase(headers[i], fontHeader));
                cell.setBackgroundColor(new Color(46, 125, 50)); // Verde Corporativo
                cell.setPadding(8);
                cell.setBorder(PdfPCell.NO_BORDER);
                if (i >= 2) cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                else cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                table.addCell(cell);
            }

            BigDecimal valorPatrimonialTotal = BigDecimal.ZERO;
            Font fontCorpo = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
            Color borderCol = new Color(229, 231, 235); // Linhas cinzas elegantes

            for (Produto p : produtos) {
                PdfPCell cId = new PdfPCell(new Phrase(String.valueOf(p.getId()), fontCorpo));
                configurarBordaFinaBase(cId, Element.ALIGN_LEFT, borderCol);
                table.addCell(cId);

                PdfPCell cNome = new PdfPCell(new Phrase(p.getNome(), fontCorpo));
                configurarBordaFinaBase(cNome, Element.ALIGN_LEFT, borderCol);
                table.addCell(cNome);

                BigDecimal qtde = p.getAGranel() ? p.getEstoque() : BigDecimal.valueOf(p.getEstoqueAtual());
                PdfPCell cQtde = new PdfPCell(new Phrase(qtde.toString(), fontCorpo));
                configurarBordaFinaBase(cQtde, Element.ALIGN_RIGHT, borderCol);
                table.addCell(cQtde);

                BigDecimal custo = p.getPrecoCusto() != null ? p.getPrecoCusto() : BigDecimal.ZERO;
                PdfPCell cCusto = new PdfPCell(new Phrase("R$ " + String.format("%.2f", custo), fontCorpo));
                configurarBordaFinaBase(cCusto, Element.ALIGN_RIGHT, borderCol);
                table.addCell(cCusto);

                BigDecimal totalItem = qtde.multiply(custo);
                valorPatrimonialTotal = valorPatrimonialTotal.add(totalItem);

                PdfPCell cTotal = new PdfPCell(new Phrase("R$ " + String.format("%.2f", totalItem), fontCorpo));
                configurarBordaFinaBase(cTotal, Element.ALIGN_RIGHT, borderCol);
                table.addCell(cTotal);
            }

            document.add(table);

            Font fontTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(198, 40, 40));
            Paragraph totalGeral = new Paragraph("\n💰 VALOR PATRIMONIAL TOTAL EM ESTOQUE: R$ " + String.format("%.2f", valorPatrimonialTotal), fontTotal);
            totalGeral.setAlignment(Element.ALIGN_RIGHT);
            document.add(totalGeral);

            document.close();

            HttpHeaders headersHttp = new HttpHeaders();
            headersHttp.setContentType(MediaType.APPLICATION_PDF);
            headersHttp.setContentDispositionFormData("filename", "Mapa_Inventario_Mercadorias.pdf");

            return new ResponseEntity<>(out.toByteArray(), headersHttp, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    
 // ==========================================================
    // 📈 ENDPOINT 2: MAPA GERENCIAL DE COMPRAS (MGC)
    // ==========================================================
    @GetMapping("/mgc")
    public ResponseEntity<byte[]> gerarMgc() {
        try {
            List<Produto> produtos = produtoRepository.findAll();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 20, 20, 20, 20);
            PdfWriter.getInstance(document, out);

            document.open();

            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.DARK_GRAY);
            Paragraph titulo = new Paragraph("📈 MGC - MAPA GERENCIAL DE COMPRAS (MARGENS DE LUCRO)", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            document.add(titulo);

            // Definição proporcional das colunas do relatório de margens
            PdfPTable table = new PdfPTable(new float[]{25f, 25f, 12f, 13f, 13f, 12f});
            table.setWidthPercentage(100);

            Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            String[] headers = {"PRODUTO", "FORNECEDOR", "P. CUSTO", "P. VENDA", "LUCRO (R$)", "MARGEM %"};
            
            for (int i = 0; i < headers.length; i++) {
                PdfPCell cell = new PdfPCell(new Phrase(headers[i], fontHeader));
                cell.setBackgroundColor(new Color(2, 136, 209)); // Azul Gerencial
                cell.setPadding(8);
                cell.setBorder(PdfPCell.NO_BORDER);
                
                if (i >= 2 && i <= 4) cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                else if (i == 5) cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                else cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                
                table.addCell(cell);
            }

            Font fontCorpo = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
            Color borderCol = new Color(229, 231, 235);

            for (Produto p : produtos) {
                // Nome do Produto
                PdfPCell cNome = new PdfPCell(new Phrase(p.getNome(), fontCorpo));
                configurarBordaFinaBase(cNome, Element.ALIGN_LEFT, borderCol);
                table.addCell(cNome);
                
                // Fornecedor Vinculado
                String nomeForn = (p.getFornecedor() != null) ? p.getFornecedor().getNome() : "Não Informado";
                PdfPCell cForn = new PdfPCell(new Phrase(nomeForn, fontCorpo));
                configurarBordaFinaBase(cForn, Element.ALIGN_LEFT, borderCol);
                table.addCell(cForn);

                // Valores Financeiros Básicos
                BigDecimal custo = (p.getPrecoCusto() != null) ? p.getPrecoCusto() : BigDecimal.ZERO;
                BigDecimal venda = (p.getPrecoVenda() != null) ? p.getPrecoVenda() : BigDecimal.ZERO;
                
                PdfPCell cCusto = new PdfPCell(new Phrase("R$ " + String.format("%.2f", custo), fontCorpo));
                configurarBordaFinaBase(cCusto, Element.ALIGN_RIGHT, borderCol);
                table.addCell(cCusto);

                PdfPCell cVenda = new PdfPCell(new Phrase("R$ " + String.format("%.2f", venda), fontCorpo));
                configurarBordaFinaBase(cVenda, Element.ALIGN_RIGHT, borderCol);
                table.addCell(cVenda);

                // Cálculo do Lucro em Reais
                BigDecimal lucroReais = venda.subtract(custo);
                PdfPCell cLucro = new PdfPCell(new Phrase("R$ " + String.format("%.2f", lucroReais), fontCorpo));
                configurarBordaFinaBase(cLucro, Element.ALIGN_RIGHT, borderCol);
                table.addCell(cLucro);

                // Cálculo da Margem Percentual (Com tratamento contra divisão por zero)
                String margemPercentual = "0.00%";
                if (custo.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal margem = lucroReais.divide(custo, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                    margemPercentual = margem.setScale(2, RoundingMode.HALF_UP).toString() + "%";
                }
                
                PdfPCell cellMargem = new PdfPCell(new Phrase(margemPercentual, fontCorpo));
                configurarBordaFinaBase(cellMargem, Element.ALIGN_CENTER, borderCol);
                table.addCell(cellMargem);
            }

            document.add(table);
            document.close();

            HttpHeaders headersHttp = new HttpHeaders();
            headersHttp.setContentType(MediaType.APPLICATION_PDF);
            headersHttp.setContentDispositionFormData("filename", "Mapa_Gerencial_Compras.pdf");

            return new ResponseEntity<>(out.toByteArray(), headersHttp, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
 // ==========================================================
    // 🖨️ ENDPOINT 3: DANFE CONSOLIDADA DE ENTRADA
    // ==========================================================
    @GetMapping("/danfe/{id}")
    public ResponseEntity<byte[]> gerarDanfeConsolidada(@PathVariable Long id) {
        try {
            // Busca os registros amarrados pelo ID no MySQL
            Entrada entrada = entradaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nota Fiscal não encontrada"));

            EntradaImpostos impostos = impostosRepository.findByEntrada_Id(id)
                .orElse(new EntradaImpostos());

            List<EntradaProdutos> produtos = entradaProdutosRepository.findByEntradaId(id);

            // Coleta os dados dinâmicos da empresa ativa na tabela origem_sistema
            OrigemSistema matriz = origemSistemaRepository.findAll().stream()
                .filter(o -> o.getOrigemSistema() != null && o.getOrigemSistema())
                .findFirst()
                .orElse(new OrigemSistema());

            Document document = new Document(PageSize.A4, 20, 20, 20, 20);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);

            document.open();

            Font fontSubtitulos = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            Font fontDadosNormal = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
            Font fontDadosNegrito = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.DARK_GRAY);

            // 1. Bloco de Cabeçalho: Matriz + Detalhes da DANFE
            PdfPTable tabelaCabecalho = new PdfPTable(2);
            tabelaCabecalho.setWidthPercentage(100);
            tabelaCabecalho.setWidths(new float[]{60f, 40f});
            tabelaCabecalho.setSpacingAfter(15f);

            StringBuilder txtEmpresa = new StringBuilder();
            txtEmpresa.append(matriz.getNome() != null ? matriz.getNome().toUpperCase() : "SISTEMA HÍBRIDO MATERIAL CONSTRUÇÃO").append("\n");
            txtEmpresa.append("CNPJ: ").append(matriz.getCnpj() != null ? matriz.getCnpj() : "26.461.699/0001-23").append("\n");
            txtEmpresa.append("Endereço: ").append(matriz.getLogradouro() != null ? matriz.getLogradouro() : "Rua Quirino dos Santos, 430").append("\n");
            txtEmpresa.append("Cidade: ").append(matriz.getCidade() != null ? matriz.getCidade() : "Curitiba").append(" / ").append(matriz.getUf() != null ? matriz.getUf() : "PR").append("\n");
            txtEmpresa.append("E-mail: ").append(matriz.getEmail() != null ? matriz.getEmail() : "josegouveadepaula@gmail.com");

            PdfPCell celEmpresa = new PdfPCell(new Phrase(txtEmpresa.toString(), fontDadosNormal));
            celEmpresa.setPadding(10f);
            celEmpresa.setBorderColor(new Color(209, 213, 219));
            celEmpresa.setBorderWidth(0.5f);
            tabelaCabecalho.addCell(celEmpresa);

            StringBuilder txtDanfe = new StringBuilder();
            txtDanfe.append("DANFE CONSOLIDADA\n");
            txtDanfe.append("Doc. Auxiliar de Entrada\n\n");
            txtDanfe.append("Nº NOTA: ").append(entrada.getNumeroNota()).append("\n");
            txtDanfe.append("SÉRIE: ").append(entrada.getSerie() != null ? entrada.getSerie() : "001").append("\n");
            txtDanfe.append("RECEBIMENTO: ").append(entrada.getDataRecebimento());

            PdfPCell celDanfe = new PdfPCell(new Phrase(txtDanfe.toString(), fontDadosNegrito));
            celDanfe.setPadding(10f);
            celDanfe.setHorizontalAlignment(Element.ALIGN_RIGHT);
            celDanfe.setBorderColor(new Color(209, 213, 219));
            celDanfe.setBorderWidth(0.5f);
            tabelaCabecalho.addCell(celDanfe);
            document.add(tabelaCabecalho);

            // 2. Quadro da Chave de Acesso
            PdfPTable tabelaChave = new PdfPTable(1);
            tabelaChave.setWidthPercentage(100);
            tabelaChave.setSpacingAfter(15f);

            PdfPCell celChaveTitulo = new PdfPCell(new Phrase("CHAVE DE ACESSO REGISTRADA (44 DÍGITOS)", fontSubtitulos));
            celChaveTitulo.setBackgroundColor(new Color(46, 125, 50));
            celChaveTitulo.setPadding(4f);
            celChaveTitulo.setBorder(PdfPCell.NO_BORDER);
            tabelaChave.addCell(celChaveTitulo);

            String chave = entrada.getChaveAcesso() != null ? entrada.getChaveAcesso() : "Não Informada";
            PdfPCell celChaveValor = new PdfPCell(new Phrase(chave, FontFactory.getFont(FontFactory.COURIER, 11, Color.DARK_GRAY)));
            celChaveValor.setPadding(8f);
            celChaveValor.setBorderColor(new Color(226, 232, 240));
            celChaveValor.setBorderWidth(0.5f);
            celChaveValor.setBackgroundColor(new Color(248, 250, 252));
            tabelaChave.addCell(celChaveValor);
            
            // 3. Quadro de Impostos e Totais (Tabela entrada_impostos)
            PdfPTable tabelaImpostos = new PdfPTable(6);
            tabelaImpostos.setWidthPercentage(100);
            tabelaImpostos.setSpacingAfter(15f);

            String[] titulosImpostos = {"BASE ICMS", "VALOR ICMS", "VLR FRETE", "VLR SEGURO", "DESCONTO", "TOTAL NOTA"};
            String[] valoresImpostos = {
                "R$ " + (impostos.getBaseCalculoIcms() != null ? String.format("%.2f", impostos.getBaseCalculoIcms()) : "0,00"),
                "R$ " + (impostos.getValorIcms() != null ? String.format("%.2f", impostos.getValorIcms()) : "0,00"),
                "R$ " + (impostos.getValorFrete() != null ? String.format("%.2f", impostos.getValorFrete()) : "0,00"),
                "R$ " + (impostos.getValorSeguro() != null ? String.format("%.2f", impostos.getValorSeguro()) : "0,00"),
                "R$ " + (impostos.getValorDesconto() != null ? String.format("%.2f", impostos.getValorDesconto()) : "0,00"),
                "R$ " + (impostos.getValorTotalNota() != null ? String.format("%.2f", impostos.getValorTotalNota()) : "0,00")
            };

            for (int i = 0; i < 6; i++) {
                String contCel = titulosImpostos[i] + "\n" + valoresImpostos[i];
                PdfPCell celImposto = new PdfPCell(new Phrase(contCel, fontDadosNegrito));
                celImposto.setPadding(8f);
                celImposto.setHorizontalAlignment(Element.ALIGN_RIGHT);
                celImposto.setBorderWidth(0.5f);

                if (i == 5) { // Destaque Verde suave para o Valor Total da Nota
                    celImposto.setBackgroundColor(new Color(240, 253, 244));
                    celImposto.setBorderColor(new Color(187, 247, 208));
                } else {
                    celImposto.setBackgroundColor(new Color(248, 250, 252));
                    celImposto.setBorderColor(new Color(226, 232, 240));
                }
                tabelaImpostos.addCell(celImposto);
            }
            document.add(tabelaImpostos);

            // 4. Grid de Materiais Lançados (Tabela entrada_produtos)
            PdfPTable tabelaProdutos = new PdfPTable(new float[]{15f, 45f, 20f, 20f});
            tabelaProdutos.setWidthPercentage(100);

            String[] colunasGrid = {"ID PROD", "DESCRIÇÃO DO ITEM", "QTD ENTRADA", "PREÇO CUSTO"};
            for (int i = 0; i < 4; i++) {
                PdfPCell th = new PdfPCell(new Phrase(colunasGrid[i], fontSubtitulos));
                th.setBackgroundColor(new Color(46, 125, 50)); // Verde do cabeçalho
                th.setPadding(8f);
                th.setBorder(PdfPCell.NO_BORDER);
                if (i >= 2) th.setHorizontalAlignment(Element.ALIGN_RIGHT);
                tabelaProdutos.addCell(th);
            }

            boolean alternarCor = false;
            Color cinzaZebra = new Color(249, 250, 251);
            Color cinzaBordaLinha = new Color(229, 231, 235);

            for (EntradaProdutos prod : produtos) {
                Color corFundoLinha = alternarCor ? cinzaZebra : Color.WHITE;
                alternarCor = !alternarCor;

                // ID do Produto
                PdfPCell cId = new PdfPCell(new Phrase(String.valueOf(prod.getProduto() != null ? prod.getProduto().getId() : "S/I"), fontDadosNormal));
                configurarBordaFinaBase(cId, Element.ALIGN_LEFT, corFundoLinha, cinzaBordaLinha);
                tabelaProdutos.addCell(cId);

                // Descrição puxando o nome real da Entidade Produto
                String nomeProd = (prod.getProduto() != null && prod.getProduto().getNome() != null) 
                                  ? prod.getProduto().getNome() 
                                  : "Produto Código: " + prod.getId();
                PdfPCell cDesc = new PdfPCell(new Phrase(nomeProd, fontDadosNormal));
                configurarBordaFinaBase(cDesc, Element.ALIGN_LEFT, corFundoLinha, cinzaBordaLinha);
                tabelaProdutos.addCell(cDesc);

                // Quantidade
                PdfPCell cQtd = new PdfPCell(new Phrase(String.valueOf(prod.getQuantidade()), fontDadosNormal));
                configurarBordaFinaBase(cQtd, Element.ALIGN_RIGHT, corFundoLinha, cinzaBordaLinha);
                tabelaProdutos.addCell(cQtd);

                // Preço de Custo formatado
                String precoFormatado = "R$ " + (prod.getPrecoCusto() != null ? String.format("%.2f", prod.getPrecoCusto()) : "0,00");
                PdfPCell cPreco = new PdfPCell(new Phrase(precoFormatado, fontDadosNormal));
                configurarBordaFinaBase(cPreco, Element.ALIGN_RIGHT, corFundoLinha, cinzaBordaLinha);
                tabelaProdutos.addCell(cPreco);
            }

            document.add(tabelaProdutos);
            document.close();

            // Envia o array de bytes binários brutos do PDF para o utils.js ler na web
            byte[] pdfBytes = baos.toByteArray();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "DANFE_Consolidada_" + id + ".pdf");

            return ResponseEntity.ok().headers(headers).body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ==========================================================
    // 🛠️ MÉTODOS AUXILIARES: CONTROLE DE DESIGN E BORDAS FINAS
    // ==========================================================
    private void configurarBordaFinaBase(PdfPCell celula, int alinhamento, Color borda) {
        celula.setPadding(6f);
        celula.setHorizontalAlignment(alinhamento);
        celula.setBorder(PdfPCell.BOTTOM); // Linha apenas na base de cada item da grade
        celula.setBorderColor(borda);
        celula.setBorderWidth(0.5f);
    }

    private void configurarBordaFinaBase(PdfPCell celula, int alinhamento, Color fundo, Color borda) {
        celula.setPadding(8f);
        celula.setHorizontalAlignment(alinhamento);
        celula.setBackgroundColor(fundo);
        celula.setBorder(PdfPCell.BOTTOM);
        celula.setBorderColor(borda);
        celula.setBorderWidth(0.5f);
    }
    
    
    // ==========================================================
    // 🔍 ENDPOINT: BUSCA NOTAS POR PERÍODO PARA O DROPDOWN
    // ==========================================================
    @GetMapping("/entradas/periodo")
    public ResponseEntity<List<com.material.dto.EntradaPeriodoDTO>> buscarEntradasPorPeriodo(
            @org.springframework.web.bind.annotation.RequestParam("inicio") String inicioStr,
            @org.springframework.web.bind.annotation.RequestParam("fim") String fimStr) {
        try {
            // Converte as Strings de data que vêm do HTML para LocalDate
            java.time.LocalDate inicio = java.time.LocalDate.parse(inicioStr);
            java.time.LocalDate fim = java.time.LocalDate.parse(fimStr);

            // Executa aquela query JPQL que você tem no EntradaRepository
            List<com.material.dto.EntradaPeriodoDTO> resultados = entradaRepository.buscarEntradasPorPeriodo(inicio, fim);

            return ResponseEntity.ok(resultados);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}


            
            
            
            
            
          
    
    
    
    
    
    
    
    
    
    
    
    