import type { EnvironmentConfig, ConnectionProperties } from '../types';

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
}
