import type { EnvironmentConfig, ConnectionProperties, ReferenceDate } from '../types';
import EnvironmentMovementService from './environment-movement-service';

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

  static async getEnvironmentsStatus(environments: EnvironmentConfig[], referenceDate: ReferenceDate): Promise<Record<string, string>[]> {
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
      
      environmentStatus.push({
        name: environment.name,
        description: environment.description,
        actualQuantity: actualData['quantidade'],
        actualValue: actualData['valor'],
        previousQuantity: oldData['quantidade'],
        previousValue: oldData['valor'],
        status: 'SUCESSO'
      })

      await environmentMovementService.close()
    }

    return environmentStatus;
  }
}
