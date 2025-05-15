import { Client } from "pg";
import type { ConnectionProperties, QueryResult } from "../types";

export class DbClient {
  private client: Client;

  constructor({ url, port, database, user, password }: ConnectionProperties) {
    this.client = new Client({
      host: url,
      port: parseInt(port),
      user: user,
      password: password,
      database: database,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  async open() {
    await this.client.connect();
  }

  async close() {
    await this.client.end();
  }

  async query(query: string): Promise<QueryResult> {
    const response = await this.client.query(query)
    return {
      content: response.rows,
      size: response.rowCount
    }
  }

}
