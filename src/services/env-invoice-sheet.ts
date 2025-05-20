import { Sheet } from "./sheet";

export class EnvInvoiceSheet extends Sheet {
  private rowNumber: number = 2;

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

      this.rowNumber++;
    }

    this.rowNumber++;

    this.sheet.cell(this.rowNumber, 19).style({font: {bold: true}}).string('Total')
    this.sheet.cell(this.rowNumber, 20).style({font: {bold: true}}).formula(`SUM(T2:T${this.rowNumber - 1})`)
  }

  buildRangeTable(ranges: Record<string, string>[]): void {
    this.rowNumber += 2;

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

      this.sheet.cell(this.rowNumber, 19).style(this.getFixedStyle()).number(0);
    }
  }

  private getHeaderStyle() {
    return this.workbook.createStyle({
      font: {
        bold: true,
        color: '#ffffff'
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: '#000000'
      },
      alignment: {
        horizontal: 'center'
      },
      numberFormat: '$#,##0.00; ($#,##0.00); -'
    })
  }

  private getRangeStyle() {
    return this.workbook.createStyle({
      numberFormat: '#,##0; (#,##0); -',
      alignment: {
        horizontal: 'right'
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: this.rowNumber % 2 === 0 ? '#d9d9d9' : '#ffffff'
      },
      border: {
        left: {
          style: 'thin',
          color: '#000000'
        },
        right: {
          style: 'thin',
          color: '#000000'
        },
        top: {
          style: 'thin',
          color: '#000000'
        },
        bottom: {
          style: 'thin',
          color: '#000000'
        }
      }
    })
  }

  private getFixedStyle() {
    return this.workbook.createStyle({
      numberFormat: 'R$ #,##0.00; (R$ #,##0.00); -',
      alignment: {
        horizontal: 'right'
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: this.rowNumber % 2 === 0 ? '#d9d9d9' : '#ffffff'
      },
      border: {
        left: {
          style: 'thin',
          color: '#000000'
        },
        right: {
          style: 'thin',
          color: '#000000'
        },
        top: {
          style: 'thin',
          color: '#000000'
        },
        bottom: {
          style: 'thin',
          color: '#000000'
        }
      }
    })
  }

  private getDecimalStyle() {
    return this.workbook.createStyle({
      numberFormat: 'R$ #,##0.00000; (R$ #,##0.00000); -',
      alignment: {
        horizontal: 'right'
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: this.rowNumber % 2 === 0 ? '#d9d9d9' : '#ffffff'
      },
      border: {
        left: {
          style: 'thin',
          color: '#000000'
        },
        right: {
          style: 'thin',
          color: '#000000'
        },
        top: {
          style: 'thin',
          color: '#000000'
        },
        bottom: {
          style: 'thin',
          color: '#000000'
        }
      }
    })
  }

  private getRowStyle(alignment?: 'left') {
    return this.workbook.createStyle({
      alignment: {
        horizontal: alignment ?? 'center',
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: this.rowNumber % 2 === 0 ? '#d9d9d9' : '#ffffff'
      },
      border: {
        left: {
          style: 'thin',
          color: '#000000'
        },
        right: {
          style: 'thin',
          color: '#000000'
        },
        top: {
          style: 'thin',
          color: '#000000'
        },
        bottom: {
          style: 'thin',
          color: '#000000'
        }
      }
    })
  }

  private getBillingType(billingType: string): string {
    const billingLabels: Record<string, string> = {
      'FIXED': 'Fixo',
      'PER_TRANSACTION': 'Adicional por Transação'
    }

    return billingLabels[billingType];
  }

}
