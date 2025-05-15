import { Workbook, Worksheet } from "excel4node";

export abstract class Sheet {
  protected sheet: Worksheet;

  constructor(workbook: Workbook, sheetName: string) {
    this.sheet = workbook.addWorksheet(sheetName);
  }

  abstract createHeader(): void;

  abstract createRows(rows: Record<string, string>[]): void;
}