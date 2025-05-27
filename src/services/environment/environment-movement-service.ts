import { EnvironmentConfig, QueryResult } from "../../types";
import { DbClient } from "../pg/db-client";
import { Utils } from "../utils/utils";

export default class EnvironmentMovementService {
  private dbClient: DbClient;
  environment: EnvironmentConfig;

  constructor(environment: EnvironmentConfig) {
    this.environment = environment;
    this.dbClient = new DbClient(Utils.getDatabasePropertiesByService(environment, 'movimentacao'));
  }

  async findMonthlyMovements(month: string, year: string): Promise<Record<string, string>[] | undefined> {
    if (!this.dbClient.isOpen) {
      await this.open();
    }

    const query = `
      select
        id,
        titulo_evento_gerador,
        titulo_classificador,
        codigo_operacao_classificador,
        titulo_conta_debito,
        numero_formatado_conta_debito,
        tipo_conta_debito,
        titulo_grupo_conta_debito,
        titulo_modalidade_grupo_conta_debito,
        tipo_modalidade_grupo_conta_debito,
        titulo_conta_credito,
        numero_formatado_conta_credito,
        tipo_conta_credito,
        titulo_grupo_conta_credito,
        titulo_modalidade_grupo_conta_credito,
        tipo_modalidade_grupo_conta_credito,
        mes,
        ano,
        valor,
        quantidade
      from movimentacao.t_classificador_mensal
      where ano = '${year}' and mes = '${month}'
      order by id_classificador
    `

    const response = await this.dbClient.query(query)

    if (!response || !response.size) {
      console.warn(`no movements found`)
      return
    }

    console.log(`found ${response.size} classifiers`)

    return response.content;
  }

  async findEnvironmentResume(month: string, year: string): Promise<QueryResult> {
    if (!this.dbClient.isOpen) {
      await this.open();
    }

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
