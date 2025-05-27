import { Sheet } from "./sheet";
import SheetStyleBuilder from "./sheet-style-builder";

type RangeResult = {
  rangeQuantity: number;
  unitValue: string;
  rangeValue: number;
}

export class EnvInvoiceSheet extends Sheet {
  private rowNumber: number = 2;
  private rowCount: number = 0;
  private rangeValues: Map<number, RangeResult> = new Map();

  createHeader(): void {
    this.sheet.column(15).setWidth(15);
    this.sheet.column(16).setWidth(15);
    this.sheet.column(17).setWidth(22);
    this.sheet.column(18).setWidth(15);
    this.sheet.column(19).setWidth(15);
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
    for (const row of rows) {
      this.sheet.cell(this.rowNumber, 1).number(parseInt(row['id']));
      this.sheet.cell(this.rowNumber, 2).string(row['titulo_evento_gerador']);
      this.sheet.cell(this.rowNumber, 3).string(row['titulo_classificador']);
      this.sheet.cell(this.rowNumber, 4).string(row['codigo_operacao_classificador']);
      this.sheet.cell(this.rowNumber, 5).string(row['titulo_conta_debito']);
      this.sheet.cell(this.rowNumber, 6).string(row['numero_formatado_conta_debito']);
      this.sheet.cell(this.rowNumber, 7).string(row['tipo_conta_debito']);
      this.sheet.cell(this.rowNumber, 8).string(row['titulo_grupo_conta_debito']);
      this.sheet.cell(this.rowNumber, 9).string(row['titulo_modalidade_grupo_conta_debito']);
      this.sheet.cell(this.rowNumber, 10).string(row['tipo_modalidade_grupo_conta_debito']);
      this.sheet.cell(this.rowNumber, 11).string(row['titulo_conta_credito']);
      this.sheet.cell(this.rowNumber, 12).string(row['numero_formatado_conta_credito']);
      this.sheet.cell(this.rowNumber, 13).string(row['tipo_conta_credito']);
      this.sheet.cell(this.rowNumber, 14).string(row['titulo_grupo_conta_credito']);
      this.sheet.cell(this.rowNumber, 15).string(row['titulo_modalidade_grupo_conta_credito']);
      this.sheet.cell(this.rowNumber, 16).string(row['tipo_modalidade_grupo_conta_credito']);
      this.sheet.cell(this.rowNumber, 17).string(row['mes']);
      this.sheet.cell(this.rowNumber, 18).string(row['ano']);
      this.sheet.cell(this.rowNumber, 19).number(parseFloat(row['valor']));
      this.sheet.cell(this.rowNumber, 20).number(parseInt(row['quantidade']));

      this.rowCount += parseInt(row['quantidade']);

      this.rowNumber++;
    }

    this.rowNumber++;

    this.sheet.cell(this.rowNumber, 19).style({font: {bold: true}}).string('Total')
    this.sheet.cell(this.rowNumber, 20).style({font: {bold: true}}).formula(`SUM(T2:T${this.rowNumber - 1})`)
  }

  buildRangeTable(ranges: Record<string, string>[]): void {
    this.rowNumber += 2;
    this.setUpRangesValue(ranges);

    // header
    const headerStyle = this.getHeaderStyle();

    this.sheet.cell(this.rowNumber, 14).style(headerStyle).string('Faixa');
    this.sheet.cell(this.rowNumber, 15).style(headerStyle).string('Inicio Faixa');
    this.sheet.cell(this.rowNumber, 16).style(headerStyle).string('Final Faixa');
    this.sheet.cell(this.rowNumber, 17).style(headerStyle).string('Tipo de Cobrança');
    this.sheet.cell(this.rowNumber, 18).style(headerStyle).string('Valor Unitário');
    this.sheet.cell(this.rowNumber, 19).style(headerStyle).string('Valor Faixa');

    
    // rows
    for (const range of ranges) {
      this.rowNumber++;
      
      this.sheet.cell(this.rowNumber, 14).style(this.getRowStyle()).number(parseInt(range['sequence']));
      this.sheet.cell(this.rowNumber, 15).style(this.getRangeStyle()).number(parseFloat(range['range_start']));
      this.sheet.cell(this.rowNumber, 16).style(this.getRangeStyle()).number(parseFloat(range['range_end'] ?? 0));
      this.sheet.cell(this.rowNumber, 17).style(this.getRowStyle('left')).string(this.getBillingType(range['billing_type']));

      if (range['billing_type'] === 'FIXED')
        this.sheet.cell(this.rowNumber, 18).style(this.getFixedStyle()).number(parseFloat(range['unit_value']));
      else
        this.sheet.cell(this.rowNumber, 18).style(this.getDecimalStyle()).number(parseFloat(range['unit_value']));

      this.sheet.cell(this.rowNumber, 19).style(this.getFixedStyle()).number(this.rangeValues.get(parseInt(range['sequence']))?.rangeValue ?? 0);
    }
  }

  buildRangeResume(): void {
    this.rowNumber += 2;

    // header
    const headerStyle = this.getResumeHeaderStyle();

    this.sheet.cell(this.rowNumber, 16).style(headerStyle).string('FAIXA');
    this.sheet.cell(this.rowNumber, 17).style(headerStyle).string('QUANTIDADE DA FAIXA');
    this.sheet.cell(this.rowNumber, 18).style(headerStyle).string('VALOR UNITÁRIO');
    this.sheet.cell(this.rowNumber, 19).style(headerStyle).string('VALOR FAIXA');

    
    this.rowNumber++;

    // rows
    for (const range of this.rangeValues.entries()) {
      this.sheet.cell(this.rowNumber, 16).style(this.getRowStyle('center', true)).number(range[0]);
      this.sheet.cell(this.rowNumber, 17).style(this.getRangeStyle(true)).number(range[1].rangeQuantity);

      if (range[1].unitValue === 'fixo') 
        this.sheet.cell(this.rowNumber, 18).style(this.getRowStyle('right', true)).string(range[1].unitValue);
      else
        this.sheet.cell(this.rowNumber, 18).style(this.getDecimalStyle(true)).number(parseFloat(range[1].unitValue));

      this.sheet.cell(this.rowNumber, 19).style(this.getFixedStyle(true)).number(range[1].rangeValue);

      this.rowNumber++;
    }

    // footer
    this.sheet.cell(this.rowNumber, 16).style(headerStyle).string('Total');
    
    this.sheet.cell(this.rowNumber, 17).style(this.getResumeHeaderStyle('number')).formula(`SUM(Q${this.rowNumber - this.rangeValues.size}:Q${this.rowNumber - 1})`);
    this.sheet.cell(this.rowNumber, 18).style(headerStyle).string('');
    this.sheet.cell(this.rowNumber, 19).style(this.getResumeHeaderStyle('currency')).formula(`SUM(S${this.rowNumber - this.rangeValues.size}:S${this.rowNumber - 1})`);

  }

  private setUpRangesValue(ranges: Record<string, string>[]): void {
    let recordsCount = this.rowCount;

    for (const range of ranges) {
      if (range['billing_type'] === 'FIXED') {
        this.rangeValues.set(parseInt(range['sequence']), {
          rangeQuantity: recordsCount >= parseInt(range['range_end']) ? parseInt(range['range_end']) : recordsCount,
          unitValue: 'fixo',
          rangeValue: parseFloat(range['unit_value'])
        });
        recordsCount -= parseInt(range['range_end']);
        continue;
      }

      if (recordsCount <= 0) {
        break;
      }

      const rangeStart = parseInt(range['range_start']) - 1;
      const rangeEnd = parseInt(range['range_end'] ?? 0);
      const unitValue = parseFloat(range['unit_value']);

      if ((recordsCount - (rangeEnd - rangeStart)) > 0) {
        this.rangeValues.set(parseInt(range['sequence']), {
          rangeQuantity: (rangeEnd - rangeStart),
          unitValue: range['unit_value'],
          rangeValue: unitValue * (rangeEnd - rangeStart)
        });
        recordsCount -= (rangeEnd - rangeStart);
        continue;
      }

      this.rangeValues.set(parseInt(range['sequence']), {
        rangeQuantity: recordsCount,
        unitValue: range['unit_value'],
        rangeValue: unitValue * recordsCount
      });
      break;
    }
  }

  private getHeaderStyle() {
    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('center')
      .font({ size: 11, bold: true, color: '#ffffff' })
      .fillColor('#000000')
      .build(this.workbook);
  }

  private getResumeHeaderStyle(variant?: 'default' | 'number' | 'currency') {
    let alignment: 'center' | 'right' = 'center';
    let numberFormat = 'R$ #,##0.00; - R$ #,##0.00; -';

    if (variant === 'number') {
      numberFormat = '#,##0; - #,##0; -';
      alignment = 'right';
    } else if (variant === 'currency') {
      numberFormat = 'R$ #,##0.00;- R$ #,##0.00; -';
      alignment = 'right';
    }

    return new SheetStyleBuilder()
      .fullBorder()
      .alignment(alignment)
      .numberFormat(numberFormat)
      .font({ size: 11, bold: true })
      .fillColor('#bfbfbf')
      .build(this.workbook);
  }

  private getRangeStyle(bgWhite?: boolean) {
    let fgColor = this.rowNumber % 2 === 0 ? '#d9d9d9' : '#ffffff';

    if (bgWhite)
      fgColor = '#ffffff';

    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('right')
      .numberFormat('#,##0;- #,##0; -')
      .font({ size: 11 })
      .fillColor(fgColor)
      .build(this.workbook);
  }

  private getFixedStyle(bgWhite?: boolean) {
    let fgColor = this.rowNumber % 2 === 0 ? '#d9d9d9' : '#ffffff';

    if (bgWhite)
      fgColor = '#ffffff';

    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('right')
      .numberFormat('R$ #,##0.00;- R$ #,##0.00; -')
      .font({ size: 11 })
      .fillColor(fgColor)
      .build(this.workbook);
  }

  private getDecimalStyle(bgWhite?: boolean) {
    let fgColor = this.rowNumber % 2 === 0 ? '#d9d9d9' : '#ffffff';

    if (bgWhite)
      fgColor = '#ffffff';

    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('right')
      .numberFormat('R$ #,##0.00000; - R$ #,##0.00000; -')
      .font({ size: 11 })
      .fillColor(fgColor)
      .build(this.workbook);
  }

  private getRowStyle(alignment: 'left' | 'center' | 'right' = 'center', bgWhite?: boolean) {
    let fgColor = this.rowNumber % 2 === 0 ? '#d9d9d9' : '#ffffff';

    if (bgWhite)
      fgColor = '#ffffff';

    return new SheetStyleBuilder()
      .fullBorder()
      .alignment(alignment)
      .font({ size: 11 })
      .fillColor(fgColor)
      .build(this.workbook);
  }

  private getBillingType(billingType: string): string {
    const billingLabels: Record<string, string> = {
      'FIXED': 'Fixo',
      'PER_TRANSACTION': 'Adicional por Transação'
    }

    return billingLabels[billingType];
  }

}
