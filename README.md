# OMNI — Transformando Experiência em Inteligência

> **OMNI** é uma solução inteligente desenvolvida para transformar o conhecimento tácito dos colaboradores em um ativo estruturado, acessível e permanente para as organizações.

---

## 📌 Sobre o Projeto

Em muitas empresas, procedimentos cruciais e resoluções de problemas ficam restritos à memória de quem os executa. Quando um colaborador muda de função ou se afasta, essas experiências valiosas correm o risco de se perderem.

A **OMNI** resolve esse desafio oferecendo uma plataforma interativa em que colaboradores podem relatar suas rotinas, aprendizados ou imprevistos por **voz** ou **texto**. Através de Inteligência Artificial, o sistema analisa, organiza e disponibiliza essas informações para consulta contínua por toda a equipe.

---

## 🛠️ Tecnologias Utilizadas

A aplicação foi desenvolvida utilizando as seguintes linguagens e tecnologias:

- **JavaScript (33.6%):** Responsável pelas interações da interface, captura e processamento de áudio/texto no frontend (`script.js`).
- **Python (30.8%):** Backend de inteligência artificial, integração com APIs de IA e lógica de processamento dos dados (`app.py`, `teste_ia.py`).
- **CSS (24.1%):** Estilização da interface web e responsividade (`style.css`).
- **HTML (11.5%):** Estrutura das páginas da aplicação web (`index.html`).
- **SQLite / DB Local:** Banco de dados relacional leve para armazenamento local das experiências (`memoria.db`).

---

## 🧠 Funcionalidades do Protótipo (MVP)

O MVP (Produto Mínimo Viável) da aplicação entrega as seguintes capacidades funcionais:

- 🎙️ **Entrada por Áudio:** Gravação direta de relatos operacionais via microfone.
- 📝 **Registro por Texto:** Digitação manual de procedimentos, experiências ou exceções.
- 🤖 **Análise Inteligente com IA:** Processamento de Linguagem Natural (PLN) para interpretar o contexto do relato.
- 📋 **Estruturação Automática:** Organização dos relatos em formatos padronizados de fácil leitura.
- ⚠️ **Mapeamento de Riscos e Exceções:** Identificação automática de gargalos ou vulnerabilidades descritos.
- 💡 **Recomendações Operacionais:** Sugestões práticas geradas pela IA para otimização de processos.
- 🔍 **Consulta à Base do Conhecimento:** Busca ágil ao histórico de relatos registrados na organização.

---

## 🔄 Fluxo de Funcionamento

```text
[ Colaborador Compartilha (Voz / Texto) ]
                  │
                  ▼
         [ Aplicação OMNI ]
                  │
                  ▼
       [ Processamento com IA ]
                  │
                  ▼
   [ Conhecimento Estruturado e Salvo ]
                  │
                  ▼
 [ Organização Consulta e Reutiliza o Ativo ]
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

- **Python 3.x** instalado.
- Um navegador web atualizado.

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/israelbritodev/OMNI.git
   cd OMNI
   ```

2. **Instale as dependências do Python:**
   *(Ajuste o comando conforme os pacotes específicos do seu `requirements.txt` ou scripts)*
   ```bash
   pip install -r requirements.txt
   ```

3. **Execute o servidor backend:**
   ```bash
   python app.py
   ```

4. **Acesse a aplicação:**
   Abra o arquivo `index.html` no navegador ou acesse o endereço indicado pelo servidor local (ex: `http://localhost:5000`).

---

## 🏆 Contexto e Reconhecimento

Projeto originalmente concebido por alunos do **SENAI Paulista** para apresentação no **Inova SENAI**, visando representar o estado em etapas nacionais e levar soluções de impacto para o ambiente corporativo e industrial.

---

## 👤 Autor

Desenvolvido por **Israel Brito Jr.** ([@israelbritodev](https://github.com/israelbritodev)).
