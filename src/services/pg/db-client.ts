import { Client } from "pg";
import type { ConnectionProperties, QueryResult } from "../../types";

export class DbClient {
  private client: Client;
  public isOpen: boolean = false;

  constructor({ url, port, database, user, password, ssl }: ConnectionProperties) {
    this.client = new Client({
      host: url,
      port: parseInt(port),
      user: user,
      password: password,
      database: database,
      ssl: ssl ?? {
        rejectUnauthorized: false
      }
    });
  }

  async open() {
    await this.client.connect();
    this.isOpen = true;
  }

  async close() {
    await this.client.end();
    this.isOpen = false;
  }

  async query(query: string): Promise<QueryResult> {
    const response = await this.client.query(query)
    return {
      content: response.rows,
      size: response.rowCount
    }
  }

}
