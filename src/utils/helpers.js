function formatarData(data) {
  if (!data) return null;

  // Se vier no formato 01.03.2026 → converte para 01/03/2026
  return String(data).replace(/\./g, "/");
}

function valorOuNull(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return null;
  }
  return valor;
}

function classificarAtividade(texto) {
  if (!texto) return "NÃO CLASSIFICADA";

  const t = String(texto).toUpperCase();

  if (t.includes("PREVENTIVA")) return "PREVENTIVA";
  if (t.includes("CORRETIVA")) return "CORRETIVA";
  if (t.includes("INSPECAO") || t.includes("INSPEÇÃO")) return "INSPEÇÃO";
  if (t.includes("LUBRIFICACAO") || t.includes("LUBRIFICAÇÃO")) return "LUBRIFICAÇÃO";

  return "OUTROS";
}

module.exports = {
  formatarData,
  valorOuNull,
  classificarAtividade
};