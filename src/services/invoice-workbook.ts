import { Workbook } from "excel4node";
import type { EnvironmentConfig, ReferenceDate } from '../types';
import { SQL_MONTHLY_CLASSIFIERS } from "../sql";
import { DbClientService } from "./db-client-service";
import { Utils } from "./utils";

export class InvoiceWorkbook {
  private workbook: Workbook;
  private environments: EnvironmentConfig[];
  private referenceDate: ReferenceDate;

  constructor(environments: EnvironmentConfig[], referenceDate: ReferenceDate) {
    this.workbook = new Workbook();
    this.environments = environments;
    this.referenceDate = referenceDate;
  }

  buildStatusSheet() {
    const sheet = this.workbook.addWorksheet('Status');
    sheet.cell(1, 1).string('Ambiente')
    sheet.cell(1, 2).string('Status')

    for (let i = 0; i < this.environments.length; i++) {
      sheet.cell(i + 2, 1).string(this.environments[i]?.name)
      // TODO - Verificar status de movimentação mensal e preencher aqui
      sheet.cell(i + 2, 2).string('SUCESSO')
    }
  }

  async buildAllEnvironmentSheets() {
    for (let i = 0; i < this.environments.length; i++) {
      console.log(`${i + 1} / ${this.environments?.length} - fetching data from: ${this.environments[i].name}`)
      await this.buildEnvironmentSheet(this.environments[i].name, this.environments[i])
    }
  }

  async buildEnvironmentSheet(sheetName: string, environment: EnvironmentConfig) {
    const sheet = this.workbook.addWorksheet(sheetName);
    
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

    const dbClientService = new DbClientService(Utils.getDatabasePropertiesByService(environment, 'movimentacao'));

    await dbClientService.open();

    const query = SQL_MONTHLY_CLASSIFIERS
      .replace('{month}', this.referenceDate.month)
      .replace('{year}', this.referenceDate.year);

    const response = await dbClientService.query(query)
    await dbClientService.close();

    const monthlyClassifierMovement = response.content;

    if (!response || !monthlyClassifierMovement.length) {
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

  write(filePath: string) {
    this.workbook.write(filePath);
  }

}
