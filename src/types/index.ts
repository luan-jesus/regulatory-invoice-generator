export type DatabaseConfig = {
  serviceName: string;
  dbUrl: string;
  dbUser: string;
  dbPassword: string;
};

export type EnvironmentConfig = {
  id: string;
  name: string;
  databases: DatabaseConfig[];
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
}

export type QueryResult = {
  content: any[];
  size: number | null;
}
