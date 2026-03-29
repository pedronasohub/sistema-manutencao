document.getElementById("formEquipamento").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    serie: document.getElementById("serie").value,
    tag: document.getElementById("tag").value,
    modelo: document.getElementById("modelo").value,
    codigo: document.getElementById("codigo").value,
    data_entrega: document.getElementById("data_entrega").value,
    data_garantia: document.getElementById("data_garantia").value,
    observacoes: document.getElementById("observacoes").value
  };

  try {
    await postJSON(`${API}/equipamentos`, payload);
    alert("Equipamento cadastrado!");
    document.getElementById("formEquipamento").reset();
    carregarEquipamentos();
  } catch (error) {
    alert(error.message);
  }
});

async function carregarEquipamentos() {
  const lista = await getJSON(`${API}/equipamentos`);
  const tbody = document.getElementById("tbodyEquipamentos");

  tbody.innerHTML = lista.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.serie || ""}</td>
      <td>${item.tag || ""}</td>
      <td>${item.modelo || ""}</td>
      <td>${item.codigo || ""}</td>
      <td>
        <div class="actions">
          <button onclick='editar(${JSON.stringify(item)})'>Editar</button>
          <button class="btn-danger" onclick="excluir(${item.id})">Excluir</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function editar(item) {
  const serie = prompt("Série:", item.serie || "");
  if (serie === null) return;

  const tag = prompt("TAG:", item.tag || "");
  if (tag === null) return;

  const modelo = prompt("Modelo:", item.modelo || "");
  if (modelo === null) return;

  const codigo = prompt("Código:", item.codigo || "");
  if (codigo === null) return;

  await postJSON(`${API}/equipamentos/${item.id}`, {
    ...item,
    serie,
    tag,
    modelo,
    codigo
  }, "PUT");

  carregarEquipamentos();
}

async function excluir(id) {
  if (!confirm("Excluir equipamento?")) return;
  await fetch(`${API}/equipamentos/${id}`, { method: "DELETE" });
  carregarEquipamentos();
}

carregarEquipamentos();