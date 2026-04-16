# Currículo do Brasil

**Gerador de currículo profissional gratuito, direto no navegador.**

Crie, personalize e exporte seu currículo em PDF formato A4 sem precisar instalar nada. Tudo funciona localmente — seus dados ficam apenas no seu computador.

---

## Funcionalidades

- **Editor em tempo real** — formulário com abas para Dados, Perfil, Carreira, Formação e Estilo
- **Preview A4** — visualização instantânea enquanto você digita, com zoom ajustável
- **Exportação em PDF** — gera o arquivo com fidelidade total ao layout exibido
- **Foto de perfil** — upload com recorte circular, zoom e reposicionamento
- **Personalização visual** — controle de cores e tamanhos de fonte por seção
- **Rascunho JSON** — salve e carregue seu currículo a qualquer momento
- **Redes sociais** — suporte a LinkedIn, Instagram e outras plataformas

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| Estilo | Tailwind CSS 3 |
| Ícones | Lucide React |
| PDF (dev) | Puppeteer via plugin Vite |
| PDF (prod) | AWS Lambda + Puppeteer Core |

---

## Como rodar localmente

**Requisitos:** Node.js 18+ e npm

```bash
# 1. Clone o repositório
git clone https://github.com/luiscriativo/curriculodobrasil.git
cd curriculodobrasil

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

> A geração de PDF em modo de desenvolvimento usa Puppeteer local. Para produção, o app se conecta a uma função AWS Lambda.

---

## Estrutura do projeto

```
curriculodobrasil/
├── src/
│   ├── app/
│   │   └── App.jsx            # Componente raiz com layout e lógica de export
│   ├── components/
│   │   ├── ResumeForm.jsx     # Painel do formulário (tabs: dados, perfil, carreira…)
│   │   ├── ResumePreview.jsx  # Preview A4 em tempo real
│   │   └── ResumePDF.jsx      # Layout renderizado para geração do PDF
│   └── main.jsx
├── index.html
├── vite.config.js             # Plugin customizado para geração de PDF em dev
├── tailwind.config.js
└── package.json
```

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot reload |
| `npm run build` | Gera o build de produção na pasta `dist/` |
| `npm run preview` | Serve o build de produção localmente |

---

## Como usar

1. Preencha seus dados pessoais na aba **Dados**
2. Escreva seu resumo profissional em **Perfil**
3. Adicione experiências em **Carreira** e formação em **Formação**
4. Ajuste as cores e fontes em **Estilo**
5. Clique em **Exportar PDF** para baixar o currículo em A4
6. Use **Salvar rascunho** para guardar seu progresso em JSON

---

## Licença

MIT — uso livre para fins pessoais e comerciais.
