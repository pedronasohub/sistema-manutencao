function formatarDataExcel(dataOriginal) {
  if (!dataOriginal) return null;

  // se vier como string 01.03.2026
  if (typeof dataOriginal === "string") {
    return dataOriginal.replace(/\./g, "/");
  }

  return dataOriginal;
}

function mapearLinhaExcelParaAtividade(linha) {
  return {
    turno: linha["T"] || null,
    contrato: linha["Contrato"] || null,
    tipo: linha["Tipo"] || null,
    data: formatarDataExcel(linha["Data"]),
    matricula: linha["Mat."] || null,
    nome: linha["Nome"] || null,
    tag: linha["TAG"] || null,
    serie: linha["Série"] || linha["Serie"] || null,
    equipamento: linha["Equip."] || null,
    hh: linha["HH"] || null,
    horimetro: linha["Horím."] || linha["Horim."] || null,
    om: linha["OM"] || null,
    atividade_requisitada: linha["Atividaderequisitada"] || null,
    job: linha["Job"] || null,
    comp: linha["Comp"] || null,
    os: linha["OS"] || null,
    ov: linha["OV"] || null,
    status: linha["Status"] || null,
    observacao: linha["Observação"] || linha["Observacao"] || null,
    valor: linha["Valor"] || null,
    classificacao: linha["Classificação"] || linha["Classificacao"] || null
  };
}

module.exports = {
  formatarDataExcel,
  mapearLinhaExcelParaAtividade
};