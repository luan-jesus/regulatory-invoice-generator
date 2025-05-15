import { Sheet } from "./sheet";

export class StatusSheet extends Sheet {

  createHeader(): void {
    this.sheet.cell(1, 1).string('Ambiente')
    this.sheet.cell(1, 2).string('Status')
  }

  createRows(rows: Record<string, string>[]): void {
    let rowIndex = 2;

    for (const row of rows) {
      this.sheet.cell(rowIndex, 1).string(row['name'])
      this.sheet.cell(rowIndex, 2).string(row['status'])

      rowIndex++;
    }
  }

}
