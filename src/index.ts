import { Client } from 'pg';
import { Workbook } from 'excel4node';

const { monthlyClassifiersSQL } = require('./sql-scripts')

// Params
const OUTPUT_DIR = "./files/";
const OUTPUT_FILE_NAME = "faturamento-2025-04";

type DatabaseConfig = {
  serviceName: string;
  dbUrl: string;
  dbUser: string;
  dbPassword: string;
};

type EnvironmentConfig = {
  id: string;
  name: string;
  databases: DatabaseConfig[];
};

async function main() {
  const environments: EnvironmentConfig[] = require("./environments.json");
  const filePath = `${OUTPUT_DIR}/${OUTPUT_FILE_NAME}.xlsx`;

  try {
    const workbook = new Workbook();

    createHeaderSheet(workbook)

    for (let i = 0; i < environments.length; i++) {
      console.log(`${i + 1} / ${environments?.length} - fetching data from: ${environments[i].name}`)
      await createEnvironmentSheet(workbook, environments[i])
    }

    workbook.write(filePath);
  } catch (ex) {
    console.error(ex)
  }

  function createHeaderSheet(workbook: Workbook) {
    const headerSheet = workbook.addWorksheet('Ambientes');
    headerSheet.cell(1, 1).string('Nome ambiente')
    headerSheet.cell(1, 2).string('Status Movimentação Classificador Mensal')

    for (let i = 0; i < environments.length; i++) {
      headerSheet.cell(i + 2, 1).string(environments[i]?.name)
      // TODO - Verificar status de movimentação mensal e preencher aqui
      headerSheet.cell(i + 2, 2).string('SUCESSO')
    }
  }

  async function createEnvironmentSheet(workbook: Workbook, environment: EnvironmentConfig) {
    const sheet = workbook.addWorksheet(environment.name);

    sheet.cell(1, 1).string('Sequencial');
    sheet.cell(1, 2).string('Evento');
    sheet.cell(1, 3).string('Classificador');
    sheet.cell(1, 4).string('Código da Operação');
    sheet.cell(1, 5).string('Título da Conta Débito');
    sheet.cell(1, 6).string('Número da Conta Débito');
    sheet.cell(1, 7).string('Tipo da Conta Débito');
    sheet.cell(1, 8).string('Título do Grupo da Conta Débito');
    sheet.cell(1, 9).string('Título da Modalidade do Grupo da Conta Débito');
    sheet.cell(1, 10).string('Tipo da Modalidade do Grupo da Conta Débito');
    sheet.cell(1, 11).string('Título da Conta Crédito');
    sheet.cell(1, 12).string('Número da Conta Crédito');
    sheet.cell(1, 13).string('Tipo da Conta Crédito');
    sheet.cell(1, 14).string('Título do Grupo da Conta Crédito');
    sheet.cell(1, 15).string('Título da Modalidade do Grupo da Conta Crédito');
    sheet.cell(1, 16).string('Tipo da Modalidade do Grupo da Conta Crédito');
    sheet.cell(1, 17).string('Mês');
    sheet.cell(1, 18).string('Ano');
    sheet.cell(1, 19).string('Valor Contábil');
    sheet.cell(1, 20).string('Quantidade');

    const { url, port, database, user, password } = getDatabasePropertiesByService(environment, 'movimentacao');
    
    const monthlyClassifierMovement = await runQuery(
      {
        url: url,
        port: parseInt(port),
        database: database,
        user: user,
        password: password
      },
      monthlyClassifiersSQL
    );

    if (!monthlyClassifierMovement || !monthlyClassifierMovement.length) {
      console.warn(`no movements found`)
      return
    }

    console.log(`found ${monthlyClassifierMovement.length} classifiers`)


    for (let i = 0; i < monthlyClassifierMovement.length; i++) {
      sheet.cell(i + 2, 1).number(parseInt(monthlyClassifierMovement[i]['id']));
      sheet.cell(i + 2, 2).string(monthlyClassifierMovement[i]['titulo_evento_gerador']);
      sheet.cell(i + 2, 3).string(monthlyClassifierMovement[i]['titulo_classificador']);
      sheet.cell(i + 2, 4).string(monthlyClassifierMovement[i]['codigo_operacao_classificador']);
      sheet.cell(i + 2, 5).string(monthlyClassifierMovement[i]['titulo_conta_debito']);
      sheet.cell(i + 2, 6).string(monthlyClassifierMovement[i]['numero_formatado_conta_debito']);
      sheet.cell(i + 2, 7).string(monthlyClassifierMovement[i]['tipo_conta_debito']);
      sheet.cell(i + 2, 8).string(monthlyClassifierMovement[i]['titulo_grupo_conta_debito']);
      sheet.cell(i + 2, 9).string(monthlyClassifierMovement[i]['titulo_modalidade_grupo_conta_debito']);
      sheet.cell(i + 2, 10).string(monthlyClassifierMovement[i]['tipo_modalidade_grupo_conta_debito']);
      sheet.cell(i + 2, 11).string(monthlyClassifierMovement[i]['titulo_conta_credito']);
      sheet.cell(i + 2, 12).string(monthlyClassifierMovement[i]['numero_formatado_conta_credito']);
      sheet.cell(i + 2, 13).string(monthlyClassifierMovement[i]['tipo_conta_credito']);
      sheet.cell(i + 2, 14).string(monthlyClassifierMovement[i]['titulo_grupo_conta_credito']);
      sheet.cell(i + 2, 15).string(monthlyClassifierMovement[i]['titulo_modalidade_grupo_conta_credito']);
      sheet.cell(i + 2, 16).string(monthlyClassifierMovement[i]['tipo_modalidade_grupo_conta_credito']);
      sheet.cell(i + 2, 17).string(monthlyClassifierMovement[i]['mes']);
      sheet.cell(i + 2, 18).string(monthlyClassifierMovement[i]['ano']);
      sheet.cell(i + 2, 19).number(parseFloat(monthlyClassifierMovement[i]['valor']));
      sheet.cell(i + 2, 20).number(parseInt(monthlyClassifierMovement[i]['quantidade']));
    }
  }

  function getDatabasePropertiesByService(environment: EnvironmentConfig, serviceName: string) {
    let url = '';
    let port = '';
    let database = '';
    let user = '';
    let password = '';

    for (const service of environment.databases) {
      if (service.serviceName.includes(serviceName)) {
          url = service.dbUrl.split("//")[1].split(":")[0];
          port = service.dbUrl.split("//")[1].split(":")[1].split("/")[0];
          database = service.dbUrl
            .split("//")[1]
            .split(":")[1]
            .split("/")[1];
          user = service.dbUser;
          password = service.dbPassword;
      }
    }

    return { url, port, database, user, password }
  }

}

type runQueryProps = {
  url: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

async function runQuery({ url, port, database, user, password }: runQueryProps, query: string) {
  const client = new Client({
    host: url,
    port: port,
    user: user,
    password: password,
    database: database,
    ssl: {
      // require: false,
      rejectUnauthorized: false
    }
  });

  let response;

  try {
    await client.connect();
    response = await client.query(query)
  } catch (error) {
    if (error instanceof Error)
      console.error("Error while running query " + error.message);
  } finally {
    client.end()
  }

  return response?.rows;
}

main();
