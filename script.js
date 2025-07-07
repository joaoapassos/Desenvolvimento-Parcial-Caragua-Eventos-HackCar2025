async function verificarHashtags() {
  const url = document.getElementById("linkInput").value;
  const palavrasChaves = document.getElementById("palavrasChavesInput").value.split(",").map(tag => tag.trim());
  const resultadoDiv = document.getElementById("resultado");

  resultadoDiv.textContent = "Verificando...";

  try {
    const response = await fetch("http://localhost:3000/verificar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url, palavrasChaves })
    });

    const data = await response.json();

    if (data.erro) {
      resultadoDiv.textContent = "Erro: " + data.erro;
    } else {
      resultadoDiv.textContent = data.encontrou ? "✅ Post válido!" : "❌ Post inválido!";
    }
  } catch (error) {
    resultadoDiv.textContent = "Erro ao conectar com o servidor.";
    console.error(error);
  }
}

async function verificarUsuario() {
  const nickEvent = document.getElementById("nickEventInput").value;
  const nickUser = document.getElementById("nickUserInput").value;
  const resultadoDiv = document.getElementById("resultado");

  const url = `https://www.instagram.com/${nickEvent}/followers/`;

  resultadoDiv.textContent = "Verificando...";

  try {
    const response = await fetch("http://localhost:3000/verificarUsuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url, nickUser })
    });

    const data = await response.json();

    if (data.erro) {
      resultadoDiv.textContent = "Erro: " + data.erro;
    } else {
      resultadoDiv.textContent = data.seguindo ? "✅ Usuário está seguindo!" : "❌ Usuário não está seguindo!";
    }
  } catch (error) {
    resultadoDiv.textContent = "Erro ao conectar com o servidor.";
    console.error(error);
  }
}