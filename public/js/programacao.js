const API_BASE = "/api/programacao";

const estado = {
  registros: [],
  registrosFiltrados: []
};

// =========================
// ELEMENTOS
// =========================
const elMes = document.getElementById("mes");
const elAno = document.getElementById("ano");
const elTipoEscala = document.getElementById("tipoEscala");
const elTurnoInicial = document.getElementById("turnoInicial");
const elDataBase = document.getElementById("dataBase");

const btnGerar = document.getElementById("btnGerar");
const btnBuscar = document.getElementById("btnBuscar");
const btnLimpar = document.getElementById("btnLimpar");

const statusBox = document.getElementById("statusBox");

const tbodyProgramacao = document.getElementById("tbodyProgramacao");
const filtroNome = document.getElementById("filtroNome");

const sumTotal = document.getElementById("sumTotal");
const sumDisponivel = document.getElementById("sumDisponivel");
const sumAfastados = document.getElementById("sumAfastados");

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  preencherDataPadrao();
  bindEventos();
});

// =========================
// EVENTOS
// =========================
function bindEventos() {
  btnGerar.addEventListener("click", onGerarProgramacao);
  btnBuscar.addEventListener("click", onBuscarProgramacao);
  btnLimpar.addEventListener("click", limparTabela);

  filtroNome.addEventListener("input", aplicarFiltro);
}

// =========================
// HELPERS
// =========================
function preencherDataPadrao() {
  const hoje = new Date();

  elMes.value = String(hoje.getMonth() + 1);
  elAno.value = String(hoje.getFullYear());

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  elDataBase.value = `${ano}-${mes}-01`;
}

function showStatus(message, type = "info") {
  statusBox.classList.remove("hidden", "success", "error", "info");
  statusBox.classList.add(type);
  statusBox.textContent = message;
}

function hideStatus() {
  statusBox.classList.add("hidden");
  statusBox.textContent = "";
}

function formatarDataBR(dataISO) {
  if (!dataISO) return "-";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function escapeHtml(texto) {
  if (texto == null) return "";
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getStatusOptions(statusAtual) {
  const lista = [
    "Disponível",
    "Atestado",
    "Férias",
    "Licença",
    "Afastado",
    "Demitido"
  ];

  return lista
    .map((status) => {
      const selected = status === statusAtual ? "selected" : "";
      return `<option value="${status}" ${selected}>${status}</option>`;
    })
    .join("");
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.mensagem || "Erro na requisição.");
  }

  return data;
}

// =========================
// AÇÕES PRINCIPAIS
// =========================
async function onGerarProgramacao() {
  hideStatus();

  try {
    btnGerar.disabled = true;
    btnGerar.textContent = "Gerando...";

    const payload = {
      mes: Number(elMes.value),
      ano: Number(elAno.value),
      tipoEscala: elTipoEscala.value,
      turnoInicial: elTurnoInicial.value,
      dataBase: elDataBase.value || null
    };

    const result = await request(`${API_BASE}/gerar`, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    showStatus(
      `Programação gerada com sucesso. Registros criados: ${result.totalRegistros || 0}`,
      "success"
    );

    await buscarProgramacao();
  } catch (error) {
    console.error("Erro ao gerar programação:", error);
    showStatus(error.message || "Erro ao gerar programação.", "error");
  } finally {
    btnGerar.disabled = false;
    btnGerar.textContent = "Gerar Programação";
  }
}

async function onBuscarProgramacao() {
  hideStatus();

  try {
    btnBuscar.disabled = true;
    btnBuscar.textContent = "Buscando...";

    await buscarProgramacao();
    showStatus("Programação carregada com sucesso.", "success");
  } catch (error) {
    console.error("Erro ao buscar programação:", error);
    showStatus(error.message || "Erro ao buscar programação.", "error");
  } finally {
    btnBuscar.disabled = false;
    btnBuscar.textContent = "Buscar Programação";
  }
}

async function buscarProgramacao() {
  const mes = Number(elMes.value);
  const ano = Number(elAno.value);

  const result = await request(`${API_BASE}?mes=${mes}&ano=${ano}`, {
    method: "GET"
  });

  estado.registros = Array.isArray(result.dados) ? result.dados : [];
  estado.registrosFiltrados = [...estado.registros];

  renderTabela();
  atualizarResumo();
}

function limparTabela() {
  estado.registros = [];
  estado.registrosFiltrados = [];
  filtroNome.value = "";
  renderTabela();
  atualizarResumo();
  hideStatus();
}

// =========================
// FILTRO
// =========================
function aplicarFiltro() {
  const termo = filtroNome.value.trim().toLowerCase();

  if (!termo) {
    estado.registrosFiltrados = [...estado.registros];
  } else {
    estado.registrosFiltrados = estado.registros.filter((item) => {
      const nome = String(item.nome || "").toLowerCase();
      const matricula = String(item.matricula || "").toLowerCase();

      return nome.includes(termo) || matricula.includes(termo);
    });
  }

  renderTabela();
  atualizarResumo();
}

// =========================
// RENDER
// =========================
function renderTabela() {
  if (!estado.registrosFiltrados.length) {
    tbodyProgramacao.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">Nenhuma programação encontrada.</td>
      </tr>
    `;
    return;
  }

  const html = estado.registrosFiltrados
    .map((item) => {
      return `
        <tr>
          <td>${item.id}</td>
          <td>${formatarDataBR(item.data_programacao)}</td>
          <td>
            <span class="badge badge-turno">${escapeHtml(item.turno || "-")}</span>
          </td>
          <td>${escapeHtml(item.matricula || "-")}</td>
          <td>${escapeHtml(item.nome || "-")}</td>
          <td>
            <select class="status-select" data-id="${item.id}">
              ${getStatusOptions(item.status)}
            </select>
          </td>
          <td>
            <input
              type="text"
              class="obs-input"
              data-id="${item.id}"
              value="${escapeHtml(item.observacao || "")}"
              placeholder="Observação"
            />
          </td>
          <td>
            <button class="btn btn-save" data-id="${item.id}">
              Salvar
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  tbodyProgramacao.innerHTML = html;

  bindAcoesTabela();
}

function bindAcoesTabela() {
  const botoesSalvar = document.querySelectorAll(".btn-save");

  botoesSalvar.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const id = botao.dataset.id;
      await salvarStatusLinha(id, botao);
    });
  });
}

function atualizarResumo() {
  const total = estado.registrosFiltrados.length;
  const disponivel = estado.registrosFiltrados.filter(
    (item) => item.status === "Disponível"
  ).length;

  const afastados = estado.registrosFiltrados.filter(
    (item) => item.status !== "Disponível"
  ).length;

  sumTotal.textContent = total;
  sumDisponivel.textContent = disponivel;
  sumAfastados.textContent = afastados;
}

// =========================
// SALVAR STATUS
// =========================
async function salvarStatusLinha(id, botao) {
  hideStatus();

  const select = document.querySelector(`.status-select[data-id="${id}"]`);
  const inputObs = document.querySelector(`.obs-input[data-id="${id}"]`);

  if (!select || !inputObs) {
    showStatus("Não foi possível localizar os campos da linha.", "error");
    return;
  }

  const status = select.value;
  const observacao = inputObs.value.trim();

  try {
    botao.disabled = true;
    botao.textContent = "Salvando...";

    await request(`${API_BASE}/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status,
        observacao: observacao || null
      })
    });

    // Atualiza estado local
    const registro = estado.registros.find((r) => String(r.id) === String(id));
    if (registro) {
      registro.status = status;
      registro.observacao = observacao || null;
    }

    const registroFiltrado = estado.registrosFiltrados.find(
      (r) => String(r.id) === String(id)
    );
    if (registroFiltrado) {
      registroFiltrado.status = status;
      registroFiltrado.observacao = observacao || null;
    }

    atualizarResumo();
    showStatus(`Registro ${id} atualizado com sucesso.`, "success");
  } catch (error) {
    console.error("Erro ao salvar status:", error);
    showStatus(error.message || "Erro ao salvar status.", "error");
  } finally {
    botao.disabled = false;
    botao.textContent = "Salvar";
  }
}