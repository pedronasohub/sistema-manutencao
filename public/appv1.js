const API_URL = "http://localhost:3000/api/atividades";

const form = document.getElementById("atividadeForm");
const tabela = document.getElementById("tabelaAtividades");
const buscaInput = document.getElementById("busca");
const btnCancelar = document.getElementById("btnCancelar");

let atividades = [];

// ----------------------
// UTIL
// ----------------------
function formatarDataParaInput(dataStr) {
  if (!dataStr) return "";

  // Se vier dd/mm/yyyy
  if (dataStr.includes("/")) {
    const [dia, mes, ano] = dataStr.split("/");
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  return dataStr;
}

function formatarDataParaBanco(dataInput) {
  if (!dataInput) return null;
  const [ano, mes, dia] = dataInput.split("-");
  return `${dia}/${mes}/${ano}`;
}

function badgeStatus(status) {
  const s = (status || "").toLowerCase();

  if (s.includes("encerr")) {
    return `<span class="badge closed">${status}</span>`;
  }

  return `<span class="badge open">${status || "-"}</span>`;
}

function limparFormulario() {
  form.reset();
  document.getElementById("id").value = "";
}

function obterDadosFormulario() {
  return {
    turno: document.getElementById("turno").value,
    contrato: document.getElementById("contrato").value,
    tipo: document.getElementById("tipo").value,
    data: formatarDataParaBanco(document.getElementById("data").value),
    matricula: document.getElementById("matricula").value || null,
    nome: document.getElementById("nome").value,
    tag: document.getElementById("tag").value,
    serie: document.getElementById("serie").value,
    equipamento: document.getElementById("equipamento").value,
    hh: document.getElementById("hh").value || null,
    horimetro: document.getElementById("horimetro").value || null,
    om: document.getElementById("om").value,
    atividade_requisitada: document.getElementById("atividade_requisitada").value,
    job: document.getElementById("job").value,
    comp: document.getElementById("comp").value,
    os: document.getElementById("os").value,
    ov: document.getElementById("ov").value,
    status: document.getElementById("status").value,
    observacao: document.getElementById("observacao").value,
    valor: document.getElementById("valor").value || null,
    classificacao: document.getElementById("classificacao").value
  };
}

// ----------------------
// API
// ----------------------
async function carregarAtividades() {
  try {
    const response = await fetch(API_URL);
    atividades = await response.json();
    renderTabela(atividades);
  } catch (error) {
    console.error("Erro ao carregar atividades:", error);
    tabela.innerHTML = `
      <tr>
        <td colspan="10" class="center">Erro ao carregar dados da API.</td>
      </tr>
    `;
  }
}

async function salvarAtividade(dados) {
  const id = document.getElementById("id").value;

  const config = {
    method: id ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  };

  const url = id ? `${API_URL}/${id}` : API_URL;

  const response = await fetch(url, config);

  if (!response.ok) {
    const erro = await response.json().catch(() => ({}));
    throw new Error(erro.erro || "Erro ao salvar atividade.");
  }

  return response.json();
}

async function excluirAtividade(id) {
  const confirmar = confirm("Deseja realmente excluir esta atividade?");
  if (!confirmar) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir.");
    }

    await carregarAtividades();
  } catch (error) {
    alert(error.message);
  }
}

// ----------------------
// RENDER
// ----------------------
function renderTabela(lista) {
  if (!lista.length) {
    tabela.innerHTML = `
      <tr>
        <td colspan="10" class="center">Nenhuma atividade encontrada.</td>
      </tr>
    `;
    return;
  }

  tabela.innerHTML = lista.map(item => `
    <tr>
      <td>${item.id || ""}</td>
      <td>${item.data || ""}</td>
      <td>${item.matricula || ""}</td>
      <td>${item.nome || ""}</td>
      <td>${item.om || ""}</td>
      <td>${item.os || ""}</td>
      <td>${item.ov || ""}</td>
      <td>${badgeStatus(item.status)}</td>
      <td>${item.classificacao || ""}</td>
      <td>
        <button class="btn edit" onclick="editarAtividade(${item.id})">Editar</button>
        <button class="btn delete" onclick="excluirAtividade(${item.id})">Excluir</button>
      </td>
    </tr>
  `).join("");
}

// ----------------------
// EDITAR
// ----------------------
function editarAtividade(id) {
  const item = atividades.find(a => a.id === id);
  if (!item) return;

  document.getElementById("id").value = item.id || "";
  document.getElementById("turno").value = item.turno || "";
  document.getElementById("contrato").value = item.contrato || "";
  document.getElementById("tipo").value = item.tipo || "";
  document.getElementById("data").value = formatarDataParaInput(item.data);
  document.getElementById("matricula").value = item.matricula || "";
  document.getElementById("nome").value = item.nome || "";
  document.getElementById("tag").value = item.tag || "";
  document.getElementById("serie").value = item.serie || "";
  document.getElementById("equipamento").value = item.equipamento || "";
  document.getElementById("hh").value = item.hh || "";
  document.getElementById("horimetro").value = item.horimetro || "";
  document.getElementById("om").value = item.om || "";
  document.getElementById("atividade_requisitada").value = item.atividade_requisitada || "";
  document.getElementById("job").value = item.job || "";
  document.getElementById("comp").value = item.comp || "";
  document.getElementById("os").value = item.os || "";
  document.getElementById("ov").value = item.ov || "";
  document.getElementById("status").value = item.status || "";
  document.getElementById("observacao").value = item.observacao || "";
  document.getElementById("valor").value = item.valor || "";
  document.getElementById("classificacao").value = item.classificacao || "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ----------------------
// EVENTOS
// ----------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const dados = obterDadosFormulario();
    await salvarAtividade(dados);
    limparFormulario();
    await carregarAtividades();
    alert("Atividade salva com sucesso!");
  } catch (error) {
    alert(error.message);
  }
});

btnCancelar.addEventListener("click", () => {
  limparFormulario();
});

buscaInput.addEventListener("input", () => {
  const termo = buscaInput.value.toLowerCase().trim();

  const filtradas = atividades.filter(item => {
    return (
      String(item.nome || "").toLowerCase().includes(termo) ||
      String(item.om || "").toLowerCase().includes(termo) ||
      String(item.ov || "").toLowerCase().includes(termo) ||
      String(item.matricula || "").toLowerCase().includes(termo)
    );
  });

  renderTabela(filtradas);
});

// Inicialização
carregarAtividades();