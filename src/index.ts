import EnvironmentMovementService from './services/environment/environment-movement-service';
import EnvironmentService from './services/environment/environment-service';
import { InvoiceWorkbook } from './services/excel4node/invoice-workbook';
import { MetadataService } from './services/utils/metadata-service';
import type { EnvironmentConfig } from './types';

const YEAR = '2025';
const MONTH = '06';
const filePath = `./files/${YEAR}-${MONTH}-FATURAMENTO-${new Date().toISOString().split('T')[0]}.xlsx`;

class RegulatoryInvoiceGenerator {
  static metadataService: MetadataService = new MetadataService();
  static environmentMovementService: Map<string, EnvironmentMovementService> = new Map();
  static environmentService: EnvironmentService = new EnvironmentService(this.environmentMovementService, this.metadataService);
  
  // main method to generate the invoice file
  static async generate() {
    try {
      await this.initializeAll();

      const invoiceWorkbook = new InvoiceWorkbook({ year: YEAR, month: MONTH }, this.metadataService, this.environmentMovementService, this.environmentService);
      await invoiceWorkbook.buildStatusSheet();
      await invoiceWorkbook.buildAllEnvironmentSheets();
      invoiceWorkbook.write(filePath);
      
      console.log(`Invoice file generated successfully at: ${filePath}`);
    } catch (error) {
      console.error(error)
    } finally {
      await this.destroyAll();
    }
  }

  // start all services and connect to the database
  static async initializeAll() {
    await this.metadataService.open();

    const environmentsResponse = await this.metadataService.findAllEnvironments();

    const environmentsJson: EnvironmentConfig[] = require("./environments.json");
    const environments = environmentsResponse.content
      .map((env: EnvironmentConfig) => {
        env.databases = environmentsJson.find((e) => e.name === env.name)?.databases || [];
        return env;
      })
      .filter((env: EnvironmentConfig) => env.active);
    
    for (const env of environments) {
      const environmentMovementService = new EnvironmentMovementService(env);
      this.environmentMovementService.set(env.name, environmentMovementService);
    }
  }

  // close all services connections
  static async destroyAll() {
    await this.metadataService.close();

    for (const movementService of this.environmentMovementService.values()) {
      await movementService.close();
    }
  }
}

RegulatoryInvoiceGenerator.generate();
