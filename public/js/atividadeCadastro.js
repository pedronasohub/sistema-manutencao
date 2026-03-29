const API_BASE = '/api/atividades';

let tecnicosDisponiveis = [];
let tecnicosSelecionados = [];

document.addEventListener('DOMContentLoaded', async () => {
  bindEvents();
  await carregarTecnicos();
  renderTabelaTecnicos();
});

function bindEvents() {
  document.getElementById('btnAdicionarTecnico').addEventListener('click', onAdicionarTecnico);
  document.getElementById('btnSalvarAtividade').addEventListener('click', onSalvarAtividade);
  document.getElementById('btnLimpar').addEventListener('click', limparFormulario);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data?.erro || data?.message || 'Erro na requisição.');
  }

  return data;
}

async function carregarTecnicos() {
  try {
    const data = await request('/api/tecnicos');
    tecnicosDisponiveis = Array.isArray(data) ? data : (data.items || []);

    const select = document.getElementById('selectTecnico');
    select.innerHTML = '<option value="">Selecione um técnico</option>';

    tecnicosDisponiveis.forEach(tecnico => {
      const option = document.createElement('option');
      option.value = tecnico.id;
      option.textContent = `${tecnico.nome} (${tecnico.matricula || 'Sem matrícula'})`;
      select.appendChild(option);
    });
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function onAdicionarTecnico() {
  const select = document.getElementById('selectTecnico');
  const tecnicoId = Number(select.value);

  if (!tecnicoId) {
    showMessage('Selecione um técnico.', 'error');
    return;
  }

  const jaExiste = tecnicosSelecionados.some(t => t.tecnico_id === tecnicoId);
  if (jaExiste) {
    showMessage('Esse técnico já foi adicionado à atividade.', 'error');
    return;
  }

  const tecnico = tecnicosDisponiveis.find(t => t.id === tecnicoId);
  if (!tecnico) {
    showMessage('Técnico não encontrado.', 'error');
    return;
  }

  tecnicosSelecionados.push({
    tecnico_id: tecnico.id,
    nome: tecnico.nome,
    hh: 0,
    lider: 0,
    status: 'PENDENTE',
    observacao: ''
  });

  select.value = '';
  renderTabelaTecnicos();
}

function renderTabelaTecnicos() {
  const tbody = document.getElementById('tbodyTecnicos');

  if (!tecnicosSelecionados.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;">Nenhum técnico adicionado.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = tecnicosSelecionados.map((tec, index) => `
    <tr>
      <td>${tec.nome}</td>
      <td>
        <input type="number" min="0" step="0.1" value="${tec.hh}" 
               onchange="atualizarHH(${index}, this.value)" />
      </td>
      <td>
        <input type="radio" name="liderTecnico" ${tec.lider ? 'checked' : ''} 
               onchange="definirLider(${index})" />
      </td>
      <td>
        <select onchange="atualizarStatusTecnico(${index}, this.value)">
          <option value="PENDENTE" ${tec.status === 'PENDENTE' ? 'selected' : ''}>PENDENTE</option>
          <option value="EM EXECUCAO" ${tec.status === 'EM EXECUCAO' ? 'selected' : ''}>EM EXECUÇÃO</option>
          <option value="CONCLUIDO" ${tec.status === 'CONCLUIDO' ? 'selected' : ''}>CONCLUÍDO</option>
        </select>
      </td>
      <td>
        <input type="text" value="${escapeHtml(tec.observacao)}" 
               onchange="atualizarObservacaoTecnico(${index}, this.value)" />
      </td>
      <td>
        <button class="btn-remove" onclick="removerTecnico(${index})">Remover</button>
      </td>
    </tr>
  `).join('');
}

function atualizarHH(index, valor) {
  tecnicosSelecionados[index].hh = Number(valor || 0);
}

function definirLider(index) {
  tecnicosSelecionados = tecnicosSelecionados.map((t, i) => ({
    ...t,
    lider: i === index ? 1 : 0
  }));
  renderTabelaTecnicos();
}

function atualizarStatusTecnico(index, valor) {
  tecnicosSelecionados[index].status = valor;
}

function atualizarObservacaoTecnico(index, valor) {
  tecnicosSelecionados[index].observacao = valor;
}

function removerTecnico(index) {
  tecnicosSelecionados.splice(index, 1);
  renderTabelaTecnicos();
}

async function onSalvarAtividade() {
  const payload = {
    tag: document.getElementById('tag').value.trim(),
    om: document.getElementById('om').value.trim(),
    atividade: document.getElementById('atividade').value.trim(),
    turno: document.getElementById('turno').value,
    status: document.getElementById('status').value,
    observacao: document.getElementById('observacao').value.trim(),
    tecnicos: tecnicosSelecionados.map(t => ({
      tecnico_id: t.tecnico_id,
      hh: Number(t.hh || 0),
      lider: t.lider ? 1 : 0,
      status: t.status || 'PENDENTE',
      observacao: t.observacao || ''
    }))
  };

  if (!payload.tag) {
    showMessage('Informe a TAG do equipamento.', 'error');
    return;
  }

  if (!payload.atividade) {
    showMessage('Informe a atividade.', 'error');
    return;
  }

  if (!payload.turno) {
    showMessage('Selecione o turno.', 'error');
    return;
  }

  if (!payload.tecnicos.length) {
    showMessage('Adicione pelo menos um técnico.', 'error');
    return;
  }

  try {
    const data = await request(API_BASE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    showMessage(data?.message || 'Atividade salva com sucesso!', 'success');
    limparFormulario();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function limparFormulario() {
  document.getElementById('tag').value = '';
  document.getElementById('om').value = '';
  document.getElementById('atividade').value = '';
  document.getElementById('turno').value = '';
  document.getElementById('status').value = 'PENDENTE';
  document.getElementById('observacao').value = '';

  tecnicosSelecionados = [];
  renderTabelaTecnicos();
}

function showMessage(message, type = 'success') {
  const msg = document.getElementById('msg');
  msg.textContent = message;
  msg.className = `msg ${type}`;
  msg.style.display = 'block';

  setTimeout(() => {
    msg.style.display = 'none';
  }, 4000);
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}