package com.material.controller;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.material.model.Produto;
import com.material.model.Entrada;
import com.material.model.EntradaImpostos;
import com.material.model.EntradaProdutos; 
import com.material.repository.ProdutoRepository;
import com.material.repository.EntradaRepository;
import com.material.repository.EntradaImpostosRepository;
import com.material.repository.EntradaProdutosRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.awt.Color;
import java.util.List;

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
    
    @GetMapping("/mim") // Endpoint do Mapa de Inventário de Mercadorias
    public ResponseEntity<byte[]> gerarMim() {
        try {
            List<Produto> produtos = produtoRepository.findAll();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Paragraph titulo = new Paragraph("🌳 MIM - MAPA DE INVENTÁRIO DE MERCADORIAS", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            document.add(titulo);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 3f, 2f, 2f, 2f});

            Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"ID", "PRODUTO", "SALDO ESTOQUE", "PREÇO CUSTO", "VALOR TOTAL"};
            
            for (String headerText : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(headerText, fontHeader));
                cell.setBackgroundColor(new Color(46, 125, 50));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            BigDecimal valorPatrimonialTotal = BigDecimal.ZERO;
            Font fontCorpo = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);

            for (Produto p : produtos) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(p.getId()), fontCorpo)));
                table.addCell(new PdfPCell(new Phrase(p.getNome(), fontCorpo)));

                BigDecimal qtde = p.getAGranel() ? p.getEstoque() : BigDecimal.valueOf(p.getEstoqueAtual());
                table.addCell(new PdfPCell(new Phrase(qtde.toString(), fontCorpo)));

                BigDecimal custo = p.getPrecoCusto() != null ? p.getPrecoCusto() : BigDecimal.ZERO;
                table.addCell(new PdfPCell(new Phrase("R$ " + custo.toString(), fontCorpo)));

                BigDecimal totalItem = qtde.multiply(custo);
                valorPatrimonialTotal = valorPatrimonialTotal.add(totalItem);

                table.addCell(new PdfPCell(new Phrase("R$ " + totalItem.toString(), fontCorpo)));
            }

            document.add(table);

            Font fontTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.RED);
            Paragraph totalGeral = new Paragraph("\n💰 VALOR PATRIMONIAL TOTAL EM ESTOQUE: R$ " + valorPatrimonialTotal.toString(), fontTotal);
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
    
    @GetMapping("/mgc") // Endpoint para o Mapa Gerencial de Compras
    public ResponseEntity<byte[]> gerarMgc() {
        try {
            List<Produto> produtos = produtoRepository.findAll();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Paragraph titulo = new Paragraph("📈 MGC - MAPA GERENCIAL DE COMPRAS (MARGENS DE LUCRO)", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            document.add(titulo);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 2f, 2f, 2f, 2f});

            Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            String[] headers = {"PRODUTO", "FORNECEDOR", "P. CUSTO", "P. VENDA", "LUCRO (R$)", "MARGEM %"};
            
            for (String headerText : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(headerText, fontHeader));
                cell.setBackgroundColor(new Color(2, 136, 209));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            Font fontCorpo = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);

            for (Produto p : produtos) {
                table.addCell(new PdfPCell(new Phrase(p.getNome(), fontCorpo)));
                
                String nomeForn = (p.getFornecedor() != null) ? p.getFornecedor().getNome() : "Não Informado";
                table.addCell(new PdfPCell(new Phrase(nomeForn, fontCorpo)));

                BigDecimal custo = (p.getPrecoCusto() != null) ? p.getPrecoCusto() : BigDecimal.ZERO;
                BigDecimal venda = (p.getPrecoVenda() != null) ? p.getPrecoVenda() : BigDecimal.ZERO;
                
                table.addCell(new PdfPCell(new Phrase("R$ " + custo.toString(), fontCorpo)));
                table.addCell(new PdfPCell(new Phrase("R$ " + venda.toString(), fontCorpo)));

                BigDecimal lucroReais = venda.subtract(custo); // 🎯 RECOMPOSIÇÃO: Cálculo completo restaurado!
                table.addCell(new PdfPCell(new Phrase("R$ " + lucroReais.toString(), fontCorpo)));

                String margemPercentual = "0.00%";
                if (custo.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal margem = lucroReais.divide(custo, 4, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100));
                    margemPercentual = margem.setScale(2, BigDecimal.ROUND_HALF_UP).toString() + "%";
                }
                
                PdfPCell cellMargem = new PdfPCell(new Phrase(margemPercentual, fontCorpo));
                cellMargem.setHorizontalAlignment(Element.ALIGN_CENTER);
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
    
    @GetMapping("/danfe/{id}") // Endpoint para a DANFE Consolidada por ID
    public ResponseEntity<byte[]> gerarDanfeConsolidada(@PathVariable Long id) {
        try {
            java.util.Optional<Entrada> entradaOpt = entradaRepository.findById(id);
            if (!entradaOpt.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Entrada entrada = entradaOpt.get();
            
            // 🎯 Segue a segurança do Optional com o tratamento do .orElse(null)
            EntradaImpostos impostos = impostosRepository.findByEntradaId(id).orElse(null);
            List<EntradaProdutos> itens = entradaProdutosRepository.findByEntradaId(id);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 20, 20, 20, 20);
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font fontChave = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);

            // 🏛️ QUADRO 1: CABEÇALHO
            PdfPTable topTable = new PdfPTable(2);
            topTable.setWidthPercentage(100);
            topTable.setWidths(new float[]{5f, 5f});

            PdfPCell cellEmitente = new PdfPCell(new Paragraph("CONSOLIDADO DE ENTRADA FISCAL\nSISTEMA HÍBRIDO MATERIAL CONSTRUÇÃO\nBanco de Dados local sincronizado no Fedora", fontBold));
            cellEmitente.setPadding(8);
            topTable.addCell(cellEmitente);

            String infoNota = "DANFE CONSOLIDADA\nDocumento Auxiliar de Entrada\n\nNº NOTA: " + entrada.getNumeroNota() + 
                              "\nSÉRIE: " + entrada.getSerie() + "\nRECEBIMENTO: " + entrada.getDataRecebimento().toString();
            PdfPCell cellInfo = new PdfPCell(new Paragraph(infoNota, fontTitulo));
            cellInfo.setHorizontalAlignment(Element.ALIGN_CENTER);
            cellInfo.setPadding(8);
            topTable.addCell(cellInfo);
            document.add(topTable);

            // 🔑 QUADRO 2: CHAVE DE ACESSO
            PdfPTable chaveTable = new PdfPTable(1);
            chaveTable.setWidthPercentage(100);
            PdfPCell cellChave = new PdfPCell(new Paragraph("CHAVE DE ACESSO REGISTRADA (44 DÍGITOS):\n" + entrada.getChaveAcesso(), fontChave));
            cellChave.setPadding(6);
            cellChave.setBackgroundColor(Color.LIGHT_GRAY);
            chaveTable.addCell(cellChave);
            document.add(chaveTable);

            document.add(new Paragraph("\n"));

            // 💰 QUADRO 3: TOTAIS E IMPOSTOS
            if (impostos != null) {
                document.add(new Paragraph("📊 VALORES TOTAIS E APURAÇÃO DO IMPOSTO", fontBold));
                PdfPTable impTable = new PdfPTable(6);
                impTable.setWidthPercentage(100);
                
                String[] headersImp = {"BASE ICMS", "VALOR ICMS", "VLR FRETE", "VLR SEGURO", "DESCONTO", "TOTAL NOTA"};
                for (String h : headersImp) {
                    PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE)));
                    cell.setBackgroundColor(new Color(44, 62, 80));
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    impTable.addCell(cell);
                }

                impTable.addCell(new PdfPCell(new Phrase("R$ " + impostos.getBaseCalculoIcms(), fontNormal)));
                impTable.addCell(new PdfPCell(new Phrase("R$ " + impostos.getValorIcms(), fontNormal)));
                impTable.addCell(new PdfPCell(new Phrase("R$ " + impostos.getValorFrete(), fontNormal)));
                impTable.addCell(new PdfPCell(new Phrase("R$ " + impostos.getValorSeguro(), fontNormal)));
                impTable.addCell(new PdfPCell(new Phrase("R$ " + impostos.getValorDesconto(), fontNormal)));
                
                PdfPCell cellTotal = new PdfPCell(new Phrase("R$ " + impostos.getValorTotalNota(), fontBold));
                cellTotal.setBackgroundColor(new Color(230, 245, 230));
                impTable.addCell(cellTotal);
                
                document.add(impTable);
            }

            document.add(new Paragraph("\n"));

            // 📦 QUADRO 4: GRID DOS ITENS
            document.add(new Paragraph("🛒 LISTA DE MATERIAIS / PRODUTOS LANÇADOS", fontBold));
            PdfPTable itensTable = new PdfPTable(4);
            itensTable.setWidthPercentage(100);
            itensTable.setWidths(new float[]{1.5f, 4.5f, 2f, 2f});

            String[] headersItens = {"ID PROD", "DESCRIÇÃO DO ITEM", "QTD ENTRADA", "PREÇO CUSTO"};
            for (String h : headersItens) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE)));
                cell.setBackgroundColor(new Color(46, 125, 50));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                itensTable.addCell(cell);
            }

            //if (itens != null) {
            //    for (EntradaProdutos item : itens) {
            //        itensTable.addCell(new PdfPCell(new Phrase(String.valueOf(item.getProdutoId()), fontNormal)));
            //        itensTable.addCell(new PdfPCell(new Phrase("Material Vinculado ID: " + item.getProdutoId(), fontNormal)));
            //        itensTable.addCell(new PdfPCell(new Phrase(String.valueOf(item.getQuantidade()), fontNormal)));
            //        itensTable.addCell(new PdfPCell(new Phrase("R$ " + item.getPrecoCusto(), fontNormal)));
            //    }
            //}
            
            
            if (itens != null) {
                // Se 'itens' for uma List, o laço abaixo roda liso se o seu Repository devolver List<EntradaProdutos>
                for (com.material.model.EntradaProdutos item : itens) {
                	
                	
                 //  itensTable.addCell(new PdfPCell(new Phrase(String.valueOf(item.getProdutoId()), fontNormal)));
                    itensTable.addCell(new PdfPCell(new Phrase("Material Vinculado ID: " + item.getProduto().getId(), fontNormal)));
                    itensTable.addCell(new PdfPCell(new Phrase(String.valueOf(item.getQuantidade()), fontNormal)));
                    itensTable.addCell(new PdfPCell(new Phrase("R$ " + item.getPrecoCusto(), fontNormal)));
                }
            }
            document.add(itensTable);

            document.close();

            HttpHeaders headersHttp = new HttpHeaders();
            headersHttp.setContentType(MediaType.APPLICATION_PDF);
            headersHttp.setContentDispositionFormData("filename", "DANFE_Consolidada_Nota_" + entrada.getNumeroNota() + ".pdf");

            return new ResponseEntity<>(out.toByteArray(), headersHttp, HttpStatus.OK);

        } catch (Exception err) {
            err.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/entradas/periodo") // 🚀 Rota exata chamada pelo fetch do Front-end!
    public ResponseEntity<List<com.material.dto.EntradaPeriodoDTO>> listarEntradasPorPeriodo(
            @org.springframework.web.bind.annotation.RequestParam("inicio") String inicio,
            @org.springframework.web.bind.annotation.RequestParam("fim") String fim) {
        try {
            // Converte os textos recebidos da tela para o formato de data do Java/MySQL
            java.time.LocalDate dataInicio = java.time.LocalDate.parse(inicio);
            java.time.LocalDate dataFim = java.time.LocalDate.parse(fim);

            // Roda a query inteligente do banco
            List<com.material.dto.EntradaPeriodoDTO> resultados = entradaRepository.buscarEntradasPorPeriodo(dataInicio, dataFim);

            return new ResponseEntity<>(resultados, HttpStatus.OK);
        } catch (Exception err) {
            err.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }  
    
    
}

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    