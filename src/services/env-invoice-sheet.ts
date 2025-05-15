import { Sheet } from "./sheet";

export class EnvInvoiceSheet extends Sheet {

  createHeader(): void {
    this.sheet.cell(1, 1).string('Sequencial');
    this.sheet.cell(1, 2).string('Evento');
    this.sheet.cell(1, 3).string('Classificador');
    this.sheet.cell(1, 4).string('Código da Operação');
    this.sheet.cell(1, 5).string('Título da Conta Débito');
    this.sheet.cell(1, 6).string('Número da Conta Débito');
    this.sheet.cell(1, 7).string('Tipo da Conta Débito');
    this.sheet.cell(1, 8).string('Título do Grupo da Conta Débito');
    this.sheet.cell(1, 9).string('Título da Modalidade do Grupo da Conta Débito');
    this.sheet.cell(1, 10).string('Tipo da Modalidade do Grupo da Conta Débito');
    this.sheet.cell(1, 11).string('Título da Conta Crédito');
    this.sheet.cell(1, 12).string('Número da Conta Crédito');
    this.sheet.cell(1, 13).string('Tipo da Conta Crédito');
    this.sheet.cell(1, 14).string('Título do Grupo da Conta Crédito');
    this.sheet.cell(1, 15).string('Título da Modalidade do Grupo da Conta Crédito');
    this.sheet.cell(1, 16).string('Tipo da Modalidade do Grupo da Conta Crédito');
    this.sheet.cell(1, 17).string('Mês');
    this.sheet.cell(1, 18).string('Ano');
    this.sheet.cell(1, 19).string('Valor Contábil');
    this.sheet.cell(1, 20).string('Quantidade');
  }

  createRows(rows: Record<string, string>[]): void {
    let rowIndex = 2;

    for (const row of rows) {
      this.sheet.cell(rowIndex, 1).number(parseInt(row['id']));
      this.sheet.cell(rowIndex, 2).string(row['titulo_evento_gerador']);
      this.sheet.cell(rowIndex, 3).string(row['titulo_classificador']);
      this.sheet.cell(rowIndex, 4).string(row['codigo_operacao_classificador']);
      this.sheet.cell(rowIndex, 5).string(row['titulo_conta_debito']);
      this.sheet.cell(rowIndex, 6).string(row['numero_formatado_conta_debito']);
      this.sheet.cell(rowIndex, 7).string(row['tipo_conta_debito']);
      this.sheet.cell(rowIndex, 8).string(row['titulo_grupo_conta_debito']);
      this.sheet.cell(rowIndex, 9).string(row['titulo_modalidade_grupo_conta_debito']);
      this.sheet.cell(rowIndex, 10).string(row['tipo_modalidade_grupo_conta_debito']);
      this.sheet.cell(rowIndex, 11).string(row['titulo_conta_credito']);
      this.sheet.cell(rowIndex, 12).string(row['numero_formatado_conta_credito']);
      this.sheet.cell(rowIndex, 13).string(row['tipo_conta_credito']);
      this.sheet.cell(rowIndex, 14).string(row['titulo_grupo_conta_credito']);
      this.sheet.cell(rowIndex, 15).string(row['titulo_modalidade_grupo_conta_credito']);
      this.sheet.cell(rowIndex, 16).string(row['tipo_modalidade_grupo_conta_credito']);
      this.sheet.cell(rowIndex, 17).string(row['mes']);
      this.sheet.cell(rowIndex, 18).string(row['ano']);
      this.sheet.cell(rowIndex, 19).number(parseFloat(row['valor']));
      this.sheet.cell(rowIndex, 20).number(parseInt(row['quantidade']));

      rowIndex++;
    }

    this.sheet.cell(rowIndex + 1, 19).style({font: {bold: true}}).string('Total')
    this.sheet.cell(rowIndex + 1, 20).style({font: {bold: true}}).formula(`SUM(T2:T${rowIndex - 1})`)
  }

}
