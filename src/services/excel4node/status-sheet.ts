import { ReferenceDate } from "../../types";
import SheetStyleBuilder from "../utils/sheet-style-builder";
import { Sheet } from "./sheet";
import { getExcelCellRef } from "excel4node";

export class StatusSheet extends Sheet {
  private referenceDate: ReferenceDate;

  constructor(workbook: any, sheetName: string, referenceDate: ReferenceDate) {
    super(workbook, sheetName);
    this.referenceDate = referenceDate;
  }

  createHeader(): void {
    this.sheet.column(1).setWidth(20)
    this.sheet.column(2).setWidth(20)
    this.sheet.column(3).setWidth(20)
    this.sheet.column(4).setWidth(20)
    this.sheet.column(5).setWidth(20)
    this.sheet.column(6).setWidth(20)
    this.sheet.column(7).setWidth(20)

    this.sheet.cell(1, 1, 2, 1, true).style(this.getHeaderStyle()).string('Ambiente')
    this.sheet.cell(1, 2, 2, 2, true).style(this.getHeaderStyle()).string('Status Rotinas')

    this.sheet.cell(1, 3, 1, 4, true).style(this.getHeaderStyle()).string(`Faturamento ${(this.getPreviousDate()).month}/${this.getPreviousDate().year}`)
    this.sheet.cell(2, 3).style(this.getHeaderStyle()).string('Volume')
    this.sheet.cell(2, 4).style(this.getHeaderStyle()).string('Valor')

    this.sheet.cell(1, 5, 1, 6, true).style(this.getHeaderStyle()).string(`Faturamento ${this.referenceDate.month}/${this.referenceDate.year}`)
    this.sheet.cell(2, 5).style(this.getHeaderStyle()).string('Volume')
    this.sheet.cell(2, 6).style(this.getHeaderStyle()).string('Valor')

    this.sheet.cell(1, 7, 2, 7, true).style(this.getHeaderStyle()).string('Diferença')
  }

  createRows(rows: Record<string, string>[]): void {
    let rowIndex = 3;

    for (const row of rows) {
      this.sheet.cell(rowIndex, 1).style(this.getDefaultStyle('left')).string(row['description'])
      this.sheet.cell(rowIndex, 2).style(row['status'] === 'SUCESSO' ? this.getSuccessStyle() : this.getErrorStyle()).string(row['status'])

      this.sheet.cell(rowIndex, 3).style(this.getRangeStyle()).number(parseInt(row['previousQuantity'] ?? 0))
      this.sheet.cell(rowIndex, 4).style(this.getFixedStyle()).number(parseFloat(row['previousValue'] ?? 0))
      this.sheet.cell(rowIndex, 5).style(this.getRangeStyle()).number(parseInt(row['actualQuantity'] ?? 0))
      this.sheet.cell(rowIndex, 6).style(this.getFixedStyle()).number(parseFloat(row['actualValue'] ?? 0))

      const difference = parseFloat(row['actualValue'] ?? 0) - parseFloat(row['previousValue'] ?? 0);

      let percentageStyle: 'positive' | 'negative' | undefined;
      if (difference > 0) {
        percentageStyle = 'positive';
      } else if (difference < 0) {
        percentageStyle = 'negative';
      }

      this.sheet.cell(rowIndex, 7).style(this.getPercentageStyle(percentageStyle)).formula(`-((${getExcelCellRef(rowIndex, 4)}-${getExcelCellRef(rowIndex, 6)})/(${getExcelCellRef(rowIndex, 4)}+${getExcelCellRef(rowIndex, 6)}))`)

      rowIndex++;
    }
  }

  private getPreviousDate(): ReferenceDate {
    const actualMonth = parseInt(this.referenceDate.month);

    return {
      month: actualMonth === 1 ? '12' : (actualMonth - 1).toString().padStart(2, '0'),
      year: actualMonth === 1 ? (parseInt(this.referenceDate.year) - 1).toString() : this.referenceDate.year.toString()
    }
  }

  private getDefaultStyle(alignment: 'left' | 'center' | 'right' = 'center') {
    return new SheetStyleBuilder()
      .fullBorder()
      .alignment(alignment)
      .font({ size: 11 })
      .fillColor('#ffffff')
      .build(this.workbook);
  }

  private getSuccessStyle() {
    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('center')
      .font({ size: 11, color: '#006100' })
      .fillColor('#c7f0cf')
      .build(this.workbook);
  }

  private getErrorStyle() {
    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('center')
      .font({ size: 11, color: '#9c0005' })
      .fillColor('#ffc7cd')
      .build(this.workbook);
  }

  private getHeaderStyle() {
    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('center')
      .font({ size: 11, bold: true })
      .fillColor('#bfbfbf')
      .build(this.workbook);
  }

  private getRangeStyle() {
    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('right')
      .font({ size: 11 })
      .numberFormat('#,##0; - #,##0; -')
      .fillColor('#ffffff')
      .build(this.workbook);
  }

  private getFixedStyle() {
    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('right')
      .font({ size: 11 })
      .numberFormat('R$ #,##0.00; - R$ #,##0.00; -')
      .fillColor('#ffffff')
      .build(this.workbook);
  }

  private getPercentageStyle(color?: 'positive' | 'negative') {
    let fontColor = '#000000';
    let fgColor = '#ffffff';

    if (color === 'positive') {
      fontColor = '#006100';
      fgColor = '#c7f0cf';
    } else if (color === 'negative') {
      fontColor = '#9c0005';
      fgColor = '#ffc7cd';
    }

    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('right')
      .font({ size: 11, color: fontColor })
      .numberFormat('0.00%; -0.00%; -')
      .fillColor(fgColor)
      .build(this.workbook);
  }
}
