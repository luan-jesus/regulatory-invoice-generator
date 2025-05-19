import type { ConnectionProperties, QueryResult } from "../types";

import { DbClient } from "./db-client";

export class MetadataService {
  private dbClient: DbClient;

  constructor() {
    const connectionProperties: ConnectionProperties = {
      url: process.env.DB_URL || "localhost",
      port: process.env.DB_PORT || "5432",
      database: process.env.DB_NAME || "faturamento",
      user: process.env.DB_USER || "regulatorio",
      password: process.env.DB_PASSWORD || "regulatorio",
      ssl: process.env.DB_SSL === "true" ? true : false,
    };

    this.dbClient = new DbClient(connectionProperties);
  }

  async fetchEnvironmentRange(idEnvironment: number): Promise<QueryResult> {
    if (!this.dbClient.isOpen) {
      await this.dbClient.open();
    }

    const query = `
      select 
        tr.id,
        tr.id_environment,
        tr."sequence",
        tr.range_start,
        tr.range_end,
        tr.billing_type,
        tr.unit_value
      from t_range tr 
      where tr.id_environment = ${idEnvironment}
      order by tr.sequence asc
    `;

    return await this.dbClient.query(query);
  }

  async findAllEnvironments(): Promise<QueryResult> {
    if (!this.dbClient.isOpen) {
      await this.dbClient.open();
    }

    const query = `
      SELECT
        id,
        name,
        description,
        active
      FROM
        t_environments
    `;

    return await this.dbClient.query(query);
  }

  async close() {
    if (this.dbClient.isOpen) {
      await this.dbClient.close();
    }
  }
}
