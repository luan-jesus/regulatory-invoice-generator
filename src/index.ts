import { InvoiceWorkbook } from './services/invoice-workbook';
import { MetadataService } from './services/metadata-service';
import type { EnvironmentConfig } from './types';

const OUTPUT_DIR = "./files/";
const YEAR = '2025';
const MONTH = '04';

async function main() {
  const environmentsJson: EnvironmentConfig[] = require("./environments.json");
  const filePath = `${OUTPUT_DIR}/${YEAR}-${MONTH}-FATURAMENTO-${new Date().toISOString().split('T')[0]}.xlsx`;

  const metadataService = new MetadataService();

  try {
    const environmentsResponse = await metadataService.findAllEnvironments();
    const environments = environmentsResponse.content
      .map((env: EnvironmentConfig) => {
        env.databases = environmentsJson.find((e) => e.name === env.name)?.databases || [];
        return env;
      })
      .filter((env: EnvironmentConfig) => env.active);

    const invoiceWorkbook = new InvoiceWorkbook(environments, { year: YEAR, month: MONTH }, metadataService);
    await invoiceWorkbook.buildStatusSheet();
    await invoiceWorkbook.buildAllEnvironmentSheets();
    invoiceWorkbook.write(filePath);
  } catch (ex) {
    console.error(ex)
  }
  finally {
    await metadataService.close();
  }
}

main();
