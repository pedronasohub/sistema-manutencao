async function gerarRelatorio() {
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;
  const responsavel = document.getElementById("responsavel").value;

  const params = new URLSearchParams();
  if (dataInicio) params.append("dataInicio", dataInicio);
  if (dataFim) params.append("dataFim", dataFim);
  if (responsavel) params.append("responsavel", responsavel);

  const lista = await getJSON(`${API}/relatorios?${params.toString()}`);
  const tbody = document.getElementById("tbodyRelatorios");

  tbody.innerHTML = lista.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.titulo || ""}</td>
      <td>${item.responsavel || ""}</td>
      <td>${item.data_inicio || ""}</td>
      <td>${item.data_termino || ""}</td>
      <td>${item.status || ""}</td>
    </tr>
  `).join("");
}
