async function carregarAtividades() {
  try {
    const lista = await getJSON(`${API}/atividades`);
    const tbody = document.getElementById("tbodyAtividades");

    tbody.innerHTML = lista.map(item => `
      <tr>
        <td>${item.id}</td>
        <td>${item.titulo || ""}</td>
        <td>${item.responsavel || ""}</td>
        <td>${item.data_inicio || ""}</td>
        <td>${item.data_termino || ""}</td>
        <td>${item.status || ""}</td>
        <td>${item.ov || ""}</td>
        <td>
          <div class="actions">
            <button onclick="editar(${item.id})">Editar</button>
            <button class="btn-danger" onclick="excluir(${item.id})">Excluir</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    alert(error.message);
  }
}

async function excluir(id) {
  if (!confirm("Deseja excluir esta atividade?")) return;

  try {
    await fetch(`${API}/atividades/${id}`, { method: "DELETE" });
    carregarAtividades();
  } catch (error) {
    alert("Erro ao excluir");
  }
}

async function editar(id) {
  const atividade = await getJSON(`${API}/atividades/${id}`);

  const titulo = prompt("Título:", atividade.titulo || "");
  if (titulo === null) return;

  const responsavel = prompt("Responsável:", atividade.responsavel || "");
  if (responsavel === null) return;

  const status = prompt("Status:", atividade.status || "");
  if (status === null) return;

  try {
    await postJSON(`${API}/atividades/${id}`, {
      ...atividade,
      titulo,
      responsavel,
      status
    }, "PUT");

    alert("Atividade atualizada!");
    carregarAtividades();
  } catch (error) {
    alert(error.message);
  }
}

carregarAtividades();