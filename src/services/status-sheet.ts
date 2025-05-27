import { Sheet } from "./sheet";
import { getExcelCellRef } from "excel4node";
import SheetStyleBuilder from "./sheet-style-builder";

export class StatusSheet extends Sheet {

  createHeader(): void {
    this.sheet.column(1).setWidth(20)
    this.sheet.column(2).setWidth(20)
    this.sheet.column(3).setWidth(20)
    this.sheet.column(4).setWidth(20)
    this.sheet.column(5).setWidth(20)
    this.sheet.column(6).setWidth(20)
    this.sheet.column(7).setWidth(20)

    this.sheet.cell(1, 1, 2, 1, true).style(this.getDefaultStyle()).string('Ambiente')
    this.sheet.cell(1, 2, 2, 2, true).style(this.getDefaultStyle()).string('Status Rotinas')

    this.sheet.cell(1, 3, 1, 4, true).style(this.getDefaultStyle()).string('Faturamento mar/2025')
    this.sheet.cell(2, 3).style(this.getDefaultStyle()).string('Volume')
    this.sheet.cell(2, 4).style(this.getDefaultStyle()).string('Valor')

    this.sheet.cell(1, 5, 1, 6, true).style(this.getDefaultStyle()).string('Faturamento abr/2025')
    this.sheet.cell(2, 5).style(this.getDefaultStyle()).string('Volume')
    this.sheet.cell(2, 6).style(this.getDefaultStyle()).string('Valor')

    this.sheet.cell(1, 7, 2, 7, true).style(this.getDefaultStyle()).string('Diferença')
  }

  createRows(rows: Record<string, string>[]): void {
    let rowIndex = 3;

    for (const row of rows) {
      this.sheet.cell(rowIndex, 1).style(this.getDefaultStyle('left')).string(row['description'])
      this.sheet.cell(rowIndex, 2).style(this.getDefaultStyle()).string(row['status'])
      this.sheet.cell(rowIndex, 3).style(this.getRangeStyle()).number(2314124) // TODO
      this.sheet.cell(rowIndex, 4).style(this.getFixedStyle()).number(5412.33) // TODO
      this.sheet.cell(rowIndex, 5).style(this.getRangeStyle()).number(4141424) // TODO
      this.sheet.cell(rowIndex, 6).style(this.getFixedStyle()).number(6412.33) // TODO
      this.sheet.cell(rowIndex, 7).style(this.getPercentageStyle()).formula(`-((${getExcelCellRef(rowIndex, 4)}-${getExcelCellRef(rowIndex, 6)})/(${getExcelCellRef(rowIndex, 4)}+${getExcelCellRef(rowIndex, 6)}))`)

      rowIndex++;
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

  private getPercentageStyle() {
    return new SheetStyleBuilder()
      .fullBorder()
      .alignment('right')
      .font({ size: 11 })
      .numberFormat('#.00%; -#.00%; -')
      .fillColor('#ffffff')
      .build(this.workbook);
  }
}
