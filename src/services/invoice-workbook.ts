import { Workbook } from "excel4node";
import type { EnvironmentConfig, ReferenceDate } from '../types';
import { SQL_MONTHLY_CLASSIFIERS } from "../sql";
import { DbClient } from "./db-client";
import { Utils } from "./utils";
import { StatusSheet } from "./status-sheet";
import { EnvInvoiceSheet } from "./env-invoice-sheet";
import { MetadataService } from "./metadata-service";

export class InvoiceWorkbook {
  private workbook: Workbook;
  private environments: EnvironmentConfig[];
  private referenceDate: ReferenceDate;
  private metadataService: MetadataService;

  constructor(environments: EnvironmentConfig[], referenceDate: ReferenceDate, metadataService: MetadataService) {
    this.workbook = new Workbook();
    this.environments = environments;
    this.referenceDate = referenceDate;
    this.metadataService = metadataService;
  }

  buildStatusSheet() {
    const statusSheet = new StatusSheet(this.workbook, 'Status');
    statusSheet.createHeader();
    statusSheet.createRows(Utils.getEnvironmentsStatus(this.environments));
  }

  async buildAllEnvironmentSheets() {
    for (let i = 0; i < this.environments.length; i++) {
      console.log(`${i + 1} / ${this.environments?.length} - fetching data from: ${this.environments[i].name}`)
      await this.buildEnvironmentSheet(this.environments[i].description, this.environments[i])
    }
  }

  async buildEnvironmentSheet(sheetName: string, environment: EnvironmentConfig) {
    const envInvoiceSheet = new EnvInvoiceSheet(this.workbook, sheetName);
    envInvoiceSheet.createHeader();

    const monthlyMovements = await this.findMonthlyMovements(environment)
    
    if (monthlyMovements)
      envInvoiceSheet.createRows(monthlyMovements);

    const ranges = await this.metadataService.fetchEnvironmentRange(environment.id);

    if (ranges && ranges.size) {
      envInvoiceSheet.buildRangeTable(ranges.content);
      envInvoiceSheet.buildRangeResume();
    }
  }

  write(filePath: string) {
    this.workbook.write(filePath);
  }

  private async findMonthlyMovements(environment: EnvironmentConfig): Promise<Record<string, string>[] | undefined> {
    const query = SQL_MONTHLY_CLASSIFIERS
      .replace('{month}', this.referenceDate.month)
      .replace('{year}', this.referenceDate.year);

    const dbClient = new DbClient(Utils.getDatabasePropertiesByService(environment, 'movimentacao'));
    await dbClient.open();
    const response = await dbClient.query(query)
    await dbClient.close();

    if (!response || !response.size) {
      console.warn(`no movements found`)
      return
    }

    console.log(`found ${response.size} classifiers`)

    return response.content;
  }
}
