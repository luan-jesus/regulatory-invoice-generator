import { InvoiceWorkbook } from './services/invoice-workbook';
import type { EnvironmentConfig } from './types';

const OUTPUT_DIR = "./files/";
const YEAR = '2025';
const MONTH = '04';

async function main() {
  const environments: EnvironmentConfig[] = require("./environments.json");
  const filePath = `${OUTPUT_DIR}/${YEAR}-${MONTH}-FATURAMENTO-${new Date().toISOString().split('T')[0]}.xlsx`;

  try {
    const invoiceWorkbook = new InvoiceWorkbook(environments, { year: YEAR, month: MONTH });
    invoiceWorkbook.buildStatusSheet();
    await invoiceWorkbook.buildAllEnvironmentSheets();
    invoiceWorkbook.write(filePath);
  } catch (ex) {
    console.error(ex)
  }
}

main();
