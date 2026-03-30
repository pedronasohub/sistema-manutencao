// ===============================
// ARQUIVO: public/js/atividadeCadastro.js
// V2 CORRIGIDA - BUSCA DE EQUIPAMENTO POR TAG
// ===============================

// ======================================================
// CONFIG
// ======================================================

const API_ATIVIDADES = '/api/atividades';
const API_CLIENTES = '/api/clientes';
const API_CONTRATOS = '/api/contratos';
const API_EQUIPAMENTOS = '/api/equipamentos';
const API_TECNICOS = '/api/tecnicos';

// ======================================================
// ELEMENTOS
// ======================================================

const form = document.getElementById('atividadeForm');

const clienteEl = document.getElementById('cliente');
const contratoEl = document.getElementById('contrato');

const tagEl = document.getElementById('tag');
const serieEl = document.getElementById('serie');
const equipamentoEl = document.getElementById('equipamento');
const horimetroEl = document.getElementById('horimetro');

const tipoEl = document.getElementById('tipo');
const atividadeRequisitadaEl = document.getElementById('atividade_requisitada');
const omEl = document.getElementById('om');
const observacaoEl = document.getElementById('observacao');

const turnoEl = document.getElementById('turno');
const duracaoEl = document.getElementById('duracao');
const jobEl = document.getElementById('job');
const compEl = document.getElementById('comp');
const dataInicioEl = document.getElementById('data_inicio');
const dataTerminoEl = document.getElementById('data_termino');

const searchTecnicoEl = document.getElementById('searchTecnico');
const selectAllTecnicosEl = document.getElementById('selectAllTecnicos');
const tecnicosTbody = document.querySelector('#tecnicosTable tbody');

const atividadesTbody = document.querySelector('#atividadesTable tbody');

// ======================================================
// ESTADO
// ======================================================

let clientes = [];
let contratos = [];
let tecnicos = [];
let tecnicosFiltrados = [];

// ======================================================
// HELPERS
// ======================================================

async function getJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erro ao buscar: ${url}`);
  }

  return response.json();
}

async function sendJSON(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(data.erro || data.message || text || 'Erro na requisição.');
  }

  return data;
}

function option(text, value = '') {
  const op = document.createElement('option');
  op.value = value;
  op.textContent = text;
  return op;
}

function limparSelect(selectEl, textoPadrao) {
  selectEl.innerHTML = '';
  selectEl.appendChild(option(textoPadrao, ''));
}

function formatarTextoSeguro(valor) {
  return valor == null ? '' : String(valor);
}

function normalizarTexto(valor) {
  return String(valor || '').trim().toLowerCase();
}

function normalizarTag(valor) {
  return String(valor || '').trim().toUpperCase();
}

function obterCampo(obj, nomes) {
  for (const nome of nomes) {
    if (obj && obj[nome] !== undefined && obj[nome] !== null) {
      return obj[nome];
    }
  }
  return null;
}

function limparCamposEquipamento() {
  serieEl.value = '';
  equipamentoEl.value = '';
  horimetroEl.value = '';
}

// ======================================================
// CLIENTES
// ======================================================

async function carregarClientes() {
  try {
    limparSelect(clienteEl, 'Selecione o cliente');

    clientes = await getJSON(API_CLIENTES);

    clientes.forEach((cliente) => {
      const id = obterCampo(cliente, ['id', 'cliente_id']);
      const nome = obterCampo(cliente, ['nome', 'cliente', 'descricao']);

      if (id != null || nome) {
        clienteEl.appendChild(option(nome || `Cliente ${id}`, id ?? nome));
      }
    });
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
  }
}

// ======================================================
// CONTRATOS
// ======================================================

async function carregarContratosPorCliente() {
  try {
    limparSelect(contratoEl, 'Selecione o contrato');

    const clienteId = clienteEl.value;
    if (!clienteId) return;

    contratos = await getJSON(`${API_CONTRATOS}?cliente_id=${encodeURIComponent(clienteId)}`);

    contratos.forEach((contrato) => {
      const id = obterCampo(contrato, ['id', 'contrato_id']);
      const codigo = obterCampo(contrato, ['codigo', 'numero', 'contrato']);
      const descricao = obterCampo(contrato, ['descricao', 'nome', 'titulo']);

      const texto = descricao
        ? `${codigo || id || ''} - ${descricao}`.trim()
        : String(codigo || id || 'Contrato');

      const valor = codigo || id || texto;

      contratoEl.appendChild(option(texto, valor));
    });

    await aplicarFiltroTecnicos();
  } catch (error) {
    console.error('Erro ao carregar contratos:', error);
  }
}

// ======================================================
// EQUIPAMENTO POR TAG
// ======================================================

async function buscarEquipamentoPorTag() {
  try {
    const tagDigitada = normalizarTag(tagEl.value);

    limparCamposEquipamento();

    if (!tagDigitada) {
      await aplicarFiltroTecnicos();
      return;
    }

    const data = await getJSON(`${API_EQUIPAMENTOS}?tag=${encodeURIComponent(tagDigitada)}`);

    let equipamentoEncontrado = null;

    if (Array.isArray(data)) {
      // CORREÇÃO PRINCIPAL:
      // não pega mais data[0] fixo
      equipamentoEncontrado = data.find((item) => {
        const tagItem = normalizarTag(obterCampo(item, ['tag', 'TAG']));
        return tagItem === tagDigitada;
      });

      // fallback: se não achar exato, tenta contains
      if (!equipamentoEncontrado) {
        equipamentoEncontrado = data.find((item) => {
          const tagItem = normalizarTag(obterCampo(item, ['tag', 'TAG']));
          return tagItem.includes(tagDigitada);
        }) || null;
      }
    } else if (data && typeof data === 'object') {
      equipamentoEncontrado = data;
    }

    if (equipamentoEncontrado) {
      serieEl.value = formatarTextoSeguro(
        obterCampo(equipamentoEncontrado, ['serie', 'serial'])
      );

      equipamentoEl.value = formatarTextoSeguro(
        obterCampo(equipamentoEncontrado, ['equipamento', 'descricao', 'nome', 'modelo'])
      );

      horimetroEl.value = formatarTextoSeguro(
        obterCampo(equipamentoEncontrado, ['horimetro', 'horimetro_atual', 'hm'])
      );
    }

    await aplicarFiltroTecnicos();
  } catch (error) {
    console.error('Erro ao buscar equipamento por TAG:', error);
    limparCamposEquipamento();
  }
}

// ======================================================
// TÉCNICOS
// ======================================================

async function carregarTecnicos() {
  try {
    tecnicos = await getJSON(API_TECNICOS);
    await aplicarFiltroTecnicos();
  } catch (error) {
    console.error('Erro ao carregar técnicos:', error);
  }
}

async function aplicarFiltroTecnicos() {
  const contratoSelecionado = normalizarTexto(contratoEl.value);
  const turnoSelecionado = normalizarTexto(turnoEl.value);

  tecnicosFiltrados = tecnicos.filter((tecnico) => {
    const turnoTecnico = normalizarTexto(obterCampo(tecnico, ['turno']));
    const contratoTecnico = normalizarTexto(
      obterCampo(tecnico, ['contrato', 'contrato_codigo', 'contrato_id', 'codigo_contrato'])
    );

    const passaTurno = !turnoSelecionado || turnoTecnico === turnoSelecionado;
    const passaContrato = !contratoSelecionado || contratoTecnico === contratoSelecionado;

    return passaTurno && passaContrato;
  });

  renderTecnicos();
}

function renderTecnicos() {
  tecnicosTbody.innerHTML = '';

  const busca = normalizarTexto(searchTecnicoEl.value);

  const lista = tecnicosFiltrados.filter((tecnico) => {
    const nome = normalizarTexto(obterCampo(tecnico, ['nome']));
    const matricula = normalizarTexto(obterCampo(tecnico, ['matricula', 'codigo']));
    return nome.includes(busca) || matricula.includes(busca);
  });

  lista.forEach((tecnico) => {
    const tr = document.createElement('tr');

    const id = obterCampo(tecnico, ['id', 'tecnico_id']);
    const matricula = obterCampo(tecnico, ['matricula', 'codigo']) || '';
    const nome = obterCampo(tecnico, ['nome']) || '';
    const supervisor = obterCampo(tecnico, ['supervisor']) || '';
    const turno = obterCampo(tecnico, ['turno']) || '';

    tr.innerHTML = `
      <td><input type="checkbox" class="tecnico-checkbox" value="${id}"></td>
      <td>${matricula}</td>
      <td>${nome}</td>
      <td>${supervisor}</td>
      <td>${turno}</td>
    `;

    tecnicosTbody.appendChild(tr);
  });
}

function obterTecnicosSelecionados() {
  return Array.from(document.querySelectorAll('.tecnico-checkbox:checked'))
    .map((el) => Number(el.value))
    .filter((v) => !Number.isNaN(v));
}

// ======================================================
// ATIVIDADES
// ======================================================

async function carregarAtividades() {
  try {
    const atividades = await getJSON(API_ATIVIDADES);

    atividadesTbody.innerHTML = '';

    atividades.forEach((atividade) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${formatarTextoSeguro(atividade.id)}</td>
        <td>${formatarTextoSeguro(atividade.cliente)}</td>
        <td>${formatarTextoSeguro(atividade.contrato)}</td>
        <td>${formatarTextoSeguro(atividade.tag)}</td>
        <td>${formatarTextoSeguro(atividade.equipamento)}</td>
        <td>${formatarTextoSeguro(atividade.tipo)}</td>
        <td>${formatarTextoSeguro(atividade.turno)}</td>
        <td>
          <button type="button" data-id="${atividade.id}" class="btn-excluir">Excluir</button>
        </td>
      `;

      atividadesTbody.appendChild(tr);
    });

    bindBotoesExcluir();
  } catch (error) {
    console.error('Erro ao carregar atividades:', error);
  }
}

function bindBotoesExcluir() {
  document.querySelectorAll('.btn-excluir').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm(`Deseja excluir a atividade ${id}?`)) return;

      try {
        await sendJSON(`${API_ATIVIDADES}/${id}`, 'DELETE');
        await carregarAtividades();
      } catch (error) {
        console.error('Erro ao excluir atividade:', error);
        alert(error.message);
      }
    });
  });
}

// ======================================================
// SUBMIT
// ======================================================

async function onSubmit(event) {
  event.preventDefault();

  try {
    const payload = {
      cliente: clienteEl.value,
      contrato: contratoEl.value,
      tag: tagEl.value.trim(),
      serie: serieEl.value.trim(),
      equipamento: equipamentoEl.value.trim(),
      horimetro: horimetroEl.value ? Number(horimetroEl.value) : null,
      tipo: tipoEl.value,
      atividade_requisitada: atividadeRequisitadaEl.value.trim(),
      om: omEl.value.trim(),
      observacao: observacaoEl.value.trim(),
      turno: turnoEl.value,
      duracao: duracaoEl.value ? Number(duracaoEl.value) : null,
      job: jobEl.value.trim(),
      comp: compEl.value.trim(),
      data_inicio: dataInicioEl.value,
      data_termino: dataTerminoEl.value,
      tecnicos: obterTecnicosSelecionados()
    };

    await sendJSON(API_ATIVIDADES, 'POST', payload);

    alert('Atividade salva com sucesso.');
    form.reset();

    limparSelect(contratoEl, 'Selecione o contrato');
    limparCamposEquipamento();
    tecnicosTbody.innerHTML = '';

    await carregarClientes();
    await carregarTecnicos();
    await carregarAtividades();
  } catch (error) {
    console.error('Erro ao salvar atividade:', error);
    alert(error.message);
  }
}

// ======================================================
// EVENTOS
// ======================================================

clienteEl.addEventListener('change', carregarContratosPorCliente);
contratoEl.addEventListener('change', aplicarFiltroTecnicos);
turnoEl.addEventListener('change', aplicarFiltroTecnicos);
tagEl.addEventListener('input', buscarEquipamentoPorTag);
searchTecnicoEl.addEventListener('input', renderTecnicos);

selectAllTecnicosEl.addEventListener('change', () => {
  const checked = selectAllTecnicosEl.checked;
  document.querySelectorAll('.tecnico-checkbox').forEach((checkbox) => {
    checkbox.checked = checked;
  });
});

form.addEventListener('submit', onSubmit);

// ======================================================
// INIT
// ======================================================

(async function init() {
  await carregarClientes();
  await carregarTecnicos();
  await carregarAtividades();
})();