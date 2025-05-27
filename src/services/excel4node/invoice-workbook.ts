import { Workbook } from "excel4node";
import type { EnvironmentConfig, ReferenceDate } from '../../types';
import { StatusSheet } from "./status-sheet";
import { EnvInvoiceSheet } from "./env-invoice-sheet";
import { MetadataService } from "../utils/metadata-service";
import EnvironmentMovementService from "../environment/environment-movement-service";
import EnvironmentService from "../environment/environment-service";

export class InvoiceWorkbook {
  private workbook: Workbook;
  private referenceDate: ReferenceDate;
  private metadataService: MetadataService;
  private environmentMovementService: Map<string, EnvironmentMovementService>;
  private environmentService: EnvironmentService;

  constructor(referenceDate: ReferenceDate, metadataService: MetadataService, environmentMovementService: Map<string, EnvironmentMovementService>, environmentService: EnvironmentService) {
    this.workbook = new Workbook();
    this.environmentMovementService = environmentMovementService;
    this.referenceDate = referenceDate;
    this.metadataService = metadataService;
    this.environmentService = environmentService;
  }

  async buildStatusSheet() {
    const statusSheet = new StatusSheet(this.workbook, 'Status');
    statusSheet.createHeader();
    statusSheet.createRows(await this.environmentService.getEnvironmentsStatus(this.referenceDate));
  }

  async buildAllEnvironmentSheets() {
    let i = 0;
    for (const movementService of this.environmentMovementService.values()) {
      console.log(`(${++i} / ${this.environmentMovementService.size}) - Fetching data for environment: ${movementService.environment.name}`);
      await this.buildEnvironmentSheet(movementService);
    }
  }

  async buildEnvironmentSheet(environmentMovementService: EnvironmentMovementService) {
    const envInvoiceSheet = new EnvInvoiceSheet(this.workbook, environmentMovementService.environment.description);
    envInvoiceSheet.createHeader();
    
    const monthlyMovements = await environmentMovementService.findMonthlyMovements(this.referenceDate.month, this.referenceDate.year);
    
    if (monthlyMovements)
      envInvoiceSheet.createRows(monthlyMovements);

    const ranges = await this.metadataService.fetchEnvironmentRange(environmentMovementService.environment.id);

    if (ranges && ranges.size) {
      envInvoiceSheet.buildRangeTable(ranges.content);
      envInvoiceSheet.buildRangeResume();
    }
  }

  write(filePath: string) {
    this.workbook.write(filePath);
  }
}
