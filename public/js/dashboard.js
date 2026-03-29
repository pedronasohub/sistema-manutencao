async function carregarDashboard() {
  try {
    const [atividades, tecnicos, equipamentos] = await Promise.all([
      getJSON(`${API}/atividades`),
      getJSON(`${API}/tecnicos`),
      getJSON(`${API}/equipamentos`)
    ]);

    document.getElementById("totalAtividades").textContent = atividades.length;
    document.getElementById("totalTecnicos").textContent = tecnicos.length;
    document.getElementById("totalEquipamentos").textContent = equipamentos.length;
  } catch (error) {
    alert(error.message);
  }
}

carregarDashboard();