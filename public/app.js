const API = '/api';

document.addEventListener('DOMContentLoaded', async () => {
  registrarEventos();
  await carregarTecnicos();
  await carregarEquipamentos();
  await carregarAtividades();
  await carregarRelatorios();
});

function registrarEventos() {
  document.getElementById('formTecnico').addEventListener('submit', salvarTecnico);
  document.getElementById('formEquipamento').addEventListener('submit', salvarEquipamento);
  document.getElementById('formAtividade').addEventListener('submit', salvarAtividade);
}

function mostrarPagina(nome) {
  document.querySelectorAll('.pagina').forEach(p => p.classList.remove('ativa'));
  document.getElementById(`pagina-${nome}`).classList.add('ativa');

  if (nome === 'atividades') carregarAtividades();
  if (nome === 'relatorios') carregarRelatorios();
  if (nome === 'tecnicos') carregarTecnicos();
  if (nome === 'equipamentos') carregarEquipamentos();
}

/* =========================
   TÉCNICOS
========================= */
async function carregarTecnicos() {
  const res = await fetch(`${API}/tecnicos`);
  const dados = await res.json();

  const lista = document.getElementById('listaTecnicos');
  const selectAtividade = document.getElementById('tecnico_id');
  const filtroTecnico = document.getElementById('filtroTecnico');

  lista.innerHTML = '';
  selectAtividade.innerHTML = '<option value="">Selecione o técnico</option>';
  filtroTecnico.innerHTML = '<option value="">Todos os técnicos</option>';

  dados.forEach(t => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <h3>${t.nome}</h3>
      <p><strong>Matrícula:</strong> ${t.matricula || ''}</p>
      <div class="acoes">
        <button onclick='editarTecnico(${JSON.stringify(t)})'>Editar</button>
        <button onclick='excluirTecnico(${t.id})'>Excluir</button>
      </div>
    `;
    lista.appendChild(div);

    selectAtividade.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
    filtroTecnico.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
  });
}

async function salvarTecnico(e) {
  e.preventDefault();

  const id = document.getElementById('tecnicoFormId').value;
  const payload = {
    matricula: document.getElementById('tecnicoMatricula').value,
    nome: document.getElementById('tecnicoNome').value
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API}/tecnicos/${id}` : `${API}/tecnicos`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.erro || 'Erro ao salvar técnico.');
    return;
  }

  document.getElementById('formTecnico').reset();
  document.getElementById('tecnicoFormId').value = '';
  await carregarTecnicos();
}

function editarTecnico(t) {
  document.getElementById('tecnicoFormId').value = t.id;
  document.getElementById('tecnicoMatricula').value = t.matricula || '';
  document.getElementById('tecnicoNome').value = t.nome || '';
  mostrarPagina('tecnicos');
}

async function excluirTecnico(id) {
  if (!confirm('Deseja excluir este técnico?')) return;

  const res = await fetch(`${API}/tecnicos/${id}`, { method: 'DELETE' });
  const data = await res.json();

  if (!res.ok) {
    alert(data.erro || 'Erro ao excluir técnico.');
    return;
  }

  await carregarTecnicos();
}

/* =========================
   EQUIPAMENTOS
========================= */
async function carregarEquipamentos() {
  const res = await fetch(`${API}/equipamentos`);
  const dados = await res.json();

  const lista = document.getElementById('listaEquipamentos');
  const selectAtividade = document.getElementById('equipamento_id');

  lista.innerHTML = '';
  selectAtividade.innerHTML = '<option value="">Selecione o equipamento</option>';

  dados.forEach(eq => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <h3>${eq.tag || 'Sem tag'} - ${eq.modelo || ''}</h3>
      <p><strong>Série:</strong> ${eq.serie || ''}</p>
      <p><strong>Código:</strong> ${eq.codigo || ''}</p>
      <div class="acoes">
        <button onclick='editarEquipamento(${JSON.stringify(eq)})'>Editar</button>
        <button onclick='excluirEquipamento(${eq.id})'>Excluir</button>
      </div>
    `;
    lista.appendChild(div);

    selectAtividade.innerHTML += `<option value="${eq.id}">${eq.tag || 'Sem tag'} - ${eq.serie || ''}</option>`;
  });
}

async function salvarEquipamento(e) {
  e.preventDefault();

  const id = document.getElementById('equipamentoFormId').value;

  const payload = {
    serie: document.getElementById('eqSerie').value,
    tag: document.getElementById('eqTag').value,
    modelo: document.getElementById('eqModelo').value,
    codigo: document.getElementById('eqCodigo').value,
    data_entrega: document.getElementById('eqDataEntrega').value,
    data_garantia: document.getElementById('eqDataGarantia').value,
    observacoes: document.getElementById('eqObservacoes').value
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API}/equipamentos/${id}` : `${API}/equipamentos`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.erro || 'Erro ao salvar equipamento.');
    return;
  }

  document.getElementById('formEquipamento').reset();
  document.getElementById('equipamentoFormId').value = '';
  await carregarEquipamentos();
}

function editarEquipamento(eq) {
  document.getElementById('equipamentoFormId').value = eq.id;
  document.getElementById('eqSerie').value = eq.serie || '';
  document.getElementById('eqTag').value = eq.tag || '';
  document.getElementById('eqModelo').value = eq.modelo || '';
  document.getElementById('eqCodigo').value = eq.codigo || '';
  document.getElementById('eqDataEntrega').value = eq.data_entrega || '';
  document.getElementById('eqDataGarantia').value = eq.data_garantia || '';
  document.getElementById('eqObservacoes').value = eq.observacoes || '';
  mostrarPagina('equipamentos');
}

async function excluirEquipamento(id) {
  if (!confirm('Deseja excluir este equipamento?')) return;

  const res = await fetch(`${API}/equipamentos/${id}`, { method: 'DELETE' });
  const data = await res.json();

  if (!res.ok) {
    alert(data.erro || 'Erro ao excluir equipamento.');
    return;
  }

  await carregarEquipamentos();
}

/* =========================
   ATIVIDADES
========================= */
async function carregarAtividades() {
  const res = await fetch(`${API}/atividades`);
  const dados = await res.json();

  const lista = document.getElementById('listaAtividades');
  lista.innerHTML = '';

  dados.forEach(a => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <h3>${a.atividade_requisitada || 'Atividade sem título'}</h3>
      <p><strong>Data:</strong> ${a.data || ''}</p>
      <p><strong>Técnico:</strong> ${a.tecnico_nome_rel || a.nome || ''}</p>
      <p><strong>Equipamento:</strong> ${a.equipamento_tag_rel || a.tag || ''}</p>
      <p><strong>OM:</strong> ${a.om || ''}</p>
      <p><strong>OV:</strong> ${a.ov || ''}</p>
      <p><strong>Status:</strong> ${a.status || ''}</p>
      <div class="acoes">
        <button onclick='editarAtividade(${JSON.stringify(a)})'>Editar</button>
        <button onclick='excluirAtividade(${a.id})'>Excluir</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

async function salvarAtividade(e) {
  e.preventDefault();

  const id = document.getElementById('atividadeId').value;

  const payload = {
    turno: document.getElementById('turno').value,
    contrato: document.getElementById('contrato').value,
    tipo: document.getElementById('tipo').value,
    data: document.getElementById('data').value,
    matricula: document.getElementById('matricula').value,
    nome: document.getElementById('nome').value,
    tag: document.getElementById('tag').value,
    serie: document.getElementById('serie').value,
    equipamento: document.getElementById('equipamento').value,
    hh: document.getElementById('hh').value,
    horimetro: document.getElementById('horimetro').value,
    om: document.getElementById('om').value,
    atividade_requisitada: document.getElementById('atividade_requisitada').value,
    job: document.getElementById('job').value,
    comp: document.getElementById('comp').value,
    os: document.getElementById('os').value,
    ov: document.getElementById('ov').value,
    status: document.getElementById('status').value,
    observacao: document.getElementById('observacao').value,
    valor: document.getElementById('valor').value,
    classificacao: document.getElementById('classificacao').value,
    tecnico_id: document.getElementById('tecnico_id').value,
    equipamento_id: document.getElementById('equipamento_id').value
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API}/atividades/${id}` : `${API}/atividades`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.erro || 'Erro ao salvar atividade.');
    return;
  }

  alert(data.mensagem || 'Salvo com sucesso.');

  document.getElementById('formAtividade').reset();
  document.getElementById('atividadeId').value = '';
  document.getElementById('titulo-form-atividade').innerText = 'Nova Atividade';

  await carregarAtividades();
  await carregarRelatorios();
  mostrarPagina('atividades');
}

function editarAtividade(a) {
  document.getElementById('atividadeId').value = a.id || '';
  document.getElementById('turno').value = a.turno || '';
  document.getElementById('contrato').value = a.contrato || '';
  document.getElementById('tipo').value = a.tipo || '';
  document.getElementById('data').value = a.data || '';
  document.getElementById('matricula').value = a.matricula || '';
  document.getElementById('nome').value = a.nome || '';
  document.getElementById('tag').value = a.tag || '';
  document.getElementById('serie').value = a.serie || '';
  document.getElementById('equipamento').value = a.equipamento || '';
  document.getElementById('hh').value = a.hh || '';
  document.getElementById('horimetro').value = a.horimetro || '';
  document.getElementById('om').value = a.om || '';
  document.getElementById('atividade_requisitada').value = a.atividade_requisitada || '';
  document.getElementById('job').value = a.job || '';
  document.getElementById('comp').value = a.comp || '';
  document.getElementById('os').value = a.os || '';
  document.getElementById('ov').value = a.ov || '';
  document.getElementById('status').value = a.status || '';
  document.getElementById('observacao').value = a.observacao || '';
  document.getElementById('valor').value = a.valor || '';
  document.getElementById('classificacao').value = a.classificacao || '';
  document.getElementById('tecnico_id').value = a.tecnico_id || '';
  document.getElementById('equipamento_id').value = a.equipamento_id || '';

  document.getElementById('titulo-form-atividade').innerText = `Editando Atividade #${a.id}`;
  mostrarPagina('nova-atividade');
}

function cancelarEdicaoAtividade() {
  document.getElementById('formAtividade').reset();
  document.getElementById('atividadeId').value = '';
  document.getElementById('titulo-form-atividade').innerText = 'Nova Atividade';
}

async function excluirAtividade(id) {
  if (!confirm('Deseja excluir esta atividade?')) return;

  const res = await fetch(`${API}/atividades/${id}`, { method: 'DELETE' });
  const data = await res.json();

  if (!res.ok) {
    alert(data.erro || 'Erro ao excluir atividade.');
    return;
  }

  await carregarAtividades();
  await carregarRelatorios();
}

/* =========================
   RELATÓRIOS
========================= */
async function carregarRelatorios() {
  const dataInicio = document.getElementById('filtroDataInicio')?.value || '';
  const dataFim = document.getElementById('filtroDataFim')?.value || '';
  const tecnico_id = document.getElementById('filtroTecnico')?.value || '';

  const params = new URLSearchParams();
  if (dataInicio) params.append('dataInicio', dataInicio);
  if (dataFim) params.append('dataFim', dataFim);
  if (tecnico_id) params.append('tecnico_id', tecnico_id);

  const res = await fetch(`${API}/relatorios?${params.toString()}`);
  const dados = await res.json();

  const lista = document.getElementById('listaRelatorios');
  lista.innerHTML = '';

  dados.forEach(a => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <h3>${a.atividade_requisitada || 'Atividade'}</h3>
      <p><strong>Data:</strong> ${a.data || ''}</p>
      <p><strong>Técnico:</strong> ${a.tecnico_nome_rel || a.nome || ''}</p>
      <p><strong>Equipamento:</strong> ${a.equipamento_tag_rel || a.tag || ''}</p>
      <p><strong>Status:</strong> ${a.status || ''}</p>
      <p><strong>OM:</strong> ${a.om || ''}</p>
      <p><strong>OV:</strong> ${a.ov || ''}</p>
    `;
    lista.appendChild(div);
  });
}