const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

app.post("/verificar", async (req, res) => {
  const body = req.body;
  const url = body.url;
  const palavrasChave = body.palavrasChaves || [];

  if (!url) return res.status(400).json({ erro: "URL não fornecida" });

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const texto = await page.evaluate(() => {
      return document.body.innerText;
    });

    await browser.close();

    const textoLower = texto.toLowerCase();
    const encontrou = palavrasChave.some(tag => textoLower.includes(tag.toLowerCase()));

    res.json({ encontrou });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao processar o scraping", detalhes: err.message });
  }
});

app.post("/verificarUsuario", async (req, res) => {
  const body = req.body;
  const url = body.url;
  const nickUser = body.nickUser;

  if (!url || !nickUser) {
    return res.status(400).json({ erro: "URL ou usuário não fornecido." });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }); // false para login manual
    const page = await browser.newPage();

    await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

    await page.goto(url, { waitUntil: "networkidle2" });

    // Aguarda o modal dos seguidores carregar
    await page.waitForSelector("div[role='dialog']");

    // Faz scroll para carregar vários seguidores
    await page.evaluate(async () => {
      const modal = document.querySelector("div[role='dialog'] ul");
      for (let i = 0; i < 10; i++) {
        modal.scrollBy(0, 1000);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });

    // Extrai nomes da lista carregada
    const usuarios = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("div[role='dialog'] span"))
        .map(el => el.textContent.toLowerCase())
        .filter(n => n && n.length > 2);
    });

    await browser.close();

    const seguindo = usuarios.includes(nickUser.toLowerCase());

    res.json({ seguindo });
  } catch (err) {
    console.error("Erro no scraping:", err);
    res.status(500).json({ erro: "Erro ao processar a verificação.", detalhes: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
