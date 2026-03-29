/* ======================================================
   ELEMENTOS
====================================================== */
const form = document.getElementById('tecnicoForm');
const tecnicoIdInput = document.getElementById('tecnicoId');
const matriculaInput = document.getElementById('matricula');
const nomeInput = document.getElementById('nome');
const contratoSelect = document.getElementById('contrato_id');
const supervisorInput = document.getElementById('supervisor');
const turnoSelect = document.getElementById('turno');
const tabelaBody = document.querySelector('#tabelaTecnicos tbody');
const btnCancelar = document.getElementById('btnCancelar');

/* ======================================================
   FETCH AUXILIAR
====================================================== */
async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let erro = `Erro ${response.status}`;
    try {
      const data = await response.json();
      erro = data.erro || data.mensagem || erro;
    } catch (_) {}
    throw new Error(erro);
  }

  return response.json();
}

/* ======================================================
   CARREGAR CONTRATOS
====================================================== */
async function carregarContratos() {
  try {
    const contratos = await fetchJSON('/api/contratos');

    contratoSelect.innerHTML = `
      <option value="">Selecione o contrato</option>
      ${contratos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
    `;
  } catch (error) {
    console.error('Erro ao carregar contratos:', error);
    alert('Erro ao carregar contratos.');
  }
}

/* ======================================================
   CARREGAR TÉCNICOS
====================================================== */
async function carregarTecnicos() {
  try {
    const tecnicos = await fetchJSON('/api/tecnicos');

    tabelaBody.innerHTML = tecnicos.map(t => `
      <tr>
        <td>${t.id}</td>
        <td>${t.matricula || ''}</td>
        <td>${t.nome || ''}</td>
        <td>${t.contrato_id || ''}</td>
        <td>${t.supervisor || ''}</td>
        <td>${t.turno || ''}</td>
        <td>
          <button type="button" onclick="editarTecnico(${t.id})">Editar</button>
          <button type="button" onclick="excluirTecnico(${t.id})">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar técnicos:', error);
    alert('Erro ao carregar técnicos.');
  }
}

/* ======================================================
   LIMPAR FORMULÁRIO
====================================================== */
function limparFormulario() {
  tecnicoIdInput.value = '';
  form.reset();
  btnCancelar.style.display = 'none';
}

/* ======================================================
   SALVAR (CRIAR / EDITAR)
====================================================== */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = tecnicoIdInput.value.trim();

  const payload = {
    matricula: matriculaInput.value.trim(),
    nome: nomeInput.value.trim(),
    contrato_id: contratoSelect.value || null,
    supervisor: supervisorInput.value.trim() || null,
    turno: turnoSelect.value || null
  };

  try {
    if (id) {
      await fetchJSON(`/api/tecnicos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      alert('Técnico atualizado com sucesso!');
    } else {
      await fetchJSON('/api/tecnicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      alert('Técnico cadastrado com sucesso!');
    }

    limparFormulario();
    await carregarTecnicos();
  } catch (error) {
    console.error('Erro ao salvar técnico:', error);
    alert(error.message || 'Erro ao salvar técnico.');
  }
});

/* ======================================================
   EDITAR
====================================================== */
window.editarTecnico = async function (id) {
  try {
    const tecnico = await fetchJSON(`/api/tecnicos/${id}`);

    tecnicoIdInput.value = tecnico.id || '';
    matriculaInput.value = tecnico.matricula || '';
    nomeInput.value = tecnico.nome || '';
    contratoSelect.value = tecnico.contrato_id || '';
    supervisorInput.value = tecnico.supervisor || '';
    turnoSelect.value = tecnico.turno || '';

    btnCancelar.style.display = 'inline-block';
  } catch (error) {
    console.error('Erro ao buscar técnico:', error);
    alert('Erro ao buscar técnico.');
  }
};

/* ======================================================
   EXCLUIR
====================================================== */
window.excluirTecnico = async function (id) {
  if (!confirm('Deseja realmente excluir este técnico?')) return;

  try {
    await fetchJSON(`/api/tecnicos/${id}`, {
      method: 'DELETE'
    });

    alert('Técnico excluído com sucesso!');
    await carregarTecnicos();
  } catch (error) {
    console.error('Erro ao excluir técnico:', error);
    alert('Erro ao excluir técnico.');
  }
};

/* ======================================================
   CANCELAR EDIÇÃO
====================================================== */
btnCancelar.addEventListener('click', () => {
  limparFormulario();
});

/* ======================================================
   INICIALIZAÇÃO
====================================================== */
(async function init() {
  await carregarContratos();
  await carregarTecnicos();
})();