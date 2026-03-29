document.getElementById("formTecnico").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await postJSON(`${API}/tecnicos`, {
      matricula: document.getElementById("matricula").value,
      nome: document.getElementById("nome").value
    });

    alert("Técnico cadastrado!");
    document.getElementById("formTecnico").reset();
    carregarTecnicos();
  } catch (error) {
    alert(error.message);
  }
});

async function carregarTecnicos() {
  const lista = await getJSON(`${API}/tecnicos`);
  const tbody = document.getElementById("tbodyTecnicos");

  tbody.innerHTML = lista.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.matricula}</td>
      <td>${item.nome}</td>
      <td>
        <div class="actions">
          <button onclick="editar(${item.id}, '${item.matricula}', '${item.nome.replace(/'/g, "\\'")}')">Editar</button>
          <button class="btn-danger" onclick="excluir(${item.id})">Excluir</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function editar(id, matriculaAtual, nomeAtual) {
  const matricula = prompt("Matrícula:", matriculaAtual);
  if (matricula === null) return;

  const nome = prompt("Nome:", nomeAtual);
  if (nome === null) return;

  await postJSON(`${API}/tecnicos/${id}`, { matricula, nome }, "PUT");
  carregarTecnicos();
}

async function excluir(id) {
  if (!confirm("Excluir técnico?")) return;
  await fetch(`${API}/tecnicos/${id}`, { method: "DELETE" });
  carregarTecnicos();
}

carregarTecnicos();