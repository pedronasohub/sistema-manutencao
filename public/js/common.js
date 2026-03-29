const API = "http://localhost:3000/api";

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao buscar dados");
  return res.json();
}

async function postJSON(url, data, method = "POST") {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.erro || "Erro na requisição");
  return json;
}