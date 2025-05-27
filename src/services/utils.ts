import type { EnvironmentConfig, ConnectionProperties, ReferenceDate } from '../types';
import { RangeResult } from './env-invoice-sheet';
import EnvironmentMovementService from './environment-movement-service';
import { MetadataService } from './metadata-service';

export class Utils {
  static getDatabasePropertiesByService(
    environment: EnvironmentConfig,
    serviceName: 'arquivo' |'auditoria' |'autenticacao' |'contabilizador' |'gerencial' |'importador' |'integrador' |'movimentacao' |'parametro' |'rotina' |'saldo'
  ): ConnectionProperties {
    const properties = {} as ConnectionProperties;

    for (const service of environment.databases) {
      if (service.serviceName.includes(serviceName)) {
        properties.url = service.dbUrl.split("//")[1].split(":")[0];
        properties.port = service.dbUrl.split("//")[1].split(":")[1].split("/")[0];
        properties.database = service.dbUrl.split("//")[1].split(":")[1].split("/")[1];
        properties.user = service.dbUser;
        properties.password = service.dbPassword;
      }
    }

    return properties;
  }

  static async getEnvironmentsStatus(environments: EnvironmentConfig[], referenceDate: ReferenceDate, metadataService: MetadataService): Promise<Record<string, string>[]> {
    const environmentStatus = []
    let i = 0;

    for (const environment of environments) {
      console.log(`${i + 1} / ${environments?.length} - fetching status from: ${environment.name}`)
      i++;
      const environmentMovementService = new EnvironmentMovementService(environment);
      await environmentMovementService.open();

      const [responseOld, responseActual] = await Promise.all([
        environmentMovementService.findEnvironmentResume('03', referenceDate.year),
        environmentMovementService.findEnvironmentResume(referenceDate.month, referenceDate.year)
      ]);
      
      const oldData = responseOld.content[0] as Record<string, any>;
      const actualData = responseActual.content[0] as Record<string, any>;

      const ranges = await metadataService.fetchEnvironmentRange(environment.id);
      
      environmentStatus.push({
        name: environment.name,
        description: environment.description,
        actualQuantity: actualData['quantidade'],
        actualValue: Utils.getRangeValue(parseInt(actualData['quantidade'] ?? 0), ranges.content),
        previousQuantity: oldData['quantidade'],
        previousValue: Utils.getRangeValue(parseInt(oldData['quantidade'] ?? 0), ranges.content),
        status: 'SUCESSO'
      })

      await environmentMovementService.close()
    }

    return environmentStatus;
  }

  static getRangeValue(recordsCount: number, ranges: Record<string, string>[]): string {
    const rangeValues: Map<number, RangeResult> = new Map();

    for (const range of ranges) {
      if (range['billing_type'] === 'FIXED') {
        rangeValues.set(parseInt(range['sequence']), {
          rangeQuantity: recordsCount >= parseInt(range['range_end']) ? parseInt(range['range_end']) : recordsCount,
          unitValue: 'fixo',
          rangeValue: parseFloat(range['unit_value'])
        });
        recordsCount -= parseInt(range['range_end']);
        continue;
      }

      if (recordsCount <= 0) {
        break;
      }

      const rangeStart = parseInt(range['range_start']) - 1;
      const rangeEnd = parseInt(range['range_end'] ?? 0);
      const unitValue = parseFloat(range['unit_value']);

      if ((recordsCount - (rangeEnd - rangeStart)) > 0) {
        rangeValues.set(parseInt(range['sequence']), {
          rangeQuantity: (rangeEnd - rangeStart),
          unitValue: range['unit_value'],
          rangeValue: unitValue * (rangeEnd - rangeStart)
        });
        recordsCount -= (rangeEnd - rangeStart);
        continue;
      }

      rangeValues.set(parseInt(range['sequence']), {
        rangeQuantity: recordsCount,
        unitValue: range['unit_value'],
        rangeValue: unitValue * recordsCount
      });
      break;
    }

    return Array.from(rangeValues.values()).reduce((acc, range) => acc + range.rangeValue, 0).toString();
  }
}
