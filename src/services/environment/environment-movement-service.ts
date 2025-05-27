import { EnvironmentConfig, QueryResult } from "../../types";
import { DbClient } from "../pg/db-client";
import { Utils } from "../utils/utils";

export default class EnvironmentMovementService {
  private dbClient: DbClient;

  constructor(environment: EnvironmentConfig) {
    this.dbClient = new DbClient(Utils.getDatabasePropertiesByService(environment, 'movimentacao'));
  }

  async findEnvironmentResume(month: string, year: string): Promise<QueryResult> {
    const query = `
      select sum(quantidade) quantidade, sum(valor) valor from movimentacao.t_classificador_mensal tcm 
      where mes = '${month}' and ano = '${year}'
    `;

    return await this.dbClient.query(query);
  }

  async open() {
    if (!this.dbClient.isOpen) {
      await this.dbClient.open();
    }
  }

  async close() {
    if (this.dbClient.isOpen) {
      await this.dbClient.close();
    }
  }

}
