export const SQL_MONTHLY_CLASSIFIERS = `
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
  where ano = '{year}' and mes = '{month}'
  order by id_classificador
`
