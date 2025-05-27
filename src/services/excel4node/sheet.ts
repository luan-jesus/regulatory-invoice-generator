import { Workbook, Worksheet } from "excel4node";

export abstract class Sheet {
  protected sheet: Worksheet;
  protected workbook: Workbook;

  constructor(workbook: Workbook, sheetName: string) {
    this.sheet = workbook.addWorksheet(sheetName);
    this.workbook = workbook;
  }

  abstract createHeader(): void;

  abstract createRows(rows: Record<string, string>[]): void;
}