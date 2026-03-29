document.getElementById("formAtividade").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    titulo: document.getElementById("titulo").value,
    responsavel: document.getElementById("responsavel").value,
    data_inicio: document.getElementById("data_inicio").value,
    data_termino: document.getElementById("data_termino").value,
    status: document.getElementById("status").value,
    classificacao: document.getElementById("classificacao").value,
    matricula: document.getElementById("matricula").value,
    nome: document.getElementById("nome").value,
    tag: document.getElementById("tag").value,
    serie: document.getElementById("serie").value,
    om: document.getElementById("om").value,
    os: document.getElementById("os").value,
    ov: document.getElementById("ov").value,
    descricao: document.getElementById("descricao").value
  };

  try {
    await postJSON(`${API}/atividades`, payload);
    alert("Atividade cadastrada com sucesso!");
    document.getElementById("formAtividade").reset();
  } catch (error) {
    alert(error.message);
  }
});