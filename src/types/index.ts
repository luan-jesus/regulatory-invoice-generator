export type DatabaseConfig = {
  serviceName: string;
  dbUrl: string;
  dbUser: string;
  dbPassword: string;
};

export type EnvironmentConfig = {
  id: number;
  name: string;
  description: string;
  databases: DatabaseConfig[];
  active: boolean;
};

export type ReferenceDate = {
  month: string,
  year: string
}

export type ConnectionProperties = {
  url: string;
  port: string;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

export type QueryResult = {
  content: any[];
  size: number | null;
}
