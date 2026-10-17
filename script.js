let resultadoConhecimentoAtual = null;

let processoSelecionado = null;

function abrirRegistro() {

    document.getElementById("dashboard").style.display = "none";

    document.getElementById("registro").style.display = "block";

}


function abrirPergunta() {

    document.getElementById("dashboard").style.display = "none";

    document.getElementById("pergunta").style.display = "block";

}


function voltarDashboard() {

    document.getElementById("registro").style.display = "none";
    document.getElementById("baseConhecimentos").style.display = "none";

    document.getElementById("pergunta").style.display = "none";

    document.getElementById("resultado").style.display = "none";

    document.getElementById("dashboard").style.display = "block";

}


function voltarRegistro() {

    document.getElementById("resultado").style.display = "none";
    document.getElementById("pergunta").style.display = "none";
    document.getElementById("baseConhecimentos").style.display = "none";

    document.getElementById("registro").style.display = "block";

}

async function analisarConhecimento() {

    const titulo =
        document.getElementById("titulo").value;

    const conhecimento =
        document.getElementById("conhecimento").value;


    if (titulo.trim() === "") {

        alert("Digite um título para o conhecimento.");

        return;

    }


    if (conhecimento.trim() === "") {

        alert("Conte sua experiência antes de analisar.");

        return;

    }


    const botao =
        document.querySelector(".botao-ia");


    botao.disabled = true;

    botao.textContent = "🧠 OMNI, Analisando...";


    try {

        const resposta = await fetch("/analisar", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                titulo: titulo,

                conhecimento: conhecimento

            })

        });


        const resultado = await resposta.json();


        resultadoConhecimentoAtual = resultado;


        if (!resposta.ok) {

            throw new Error(
                resultado.erro || "Erro ao analisar."
            );

        }


        /*
        COLOCANDO O RESULTADO DA IA NA TELA
        */


        document.getElementById(
            "resultadoTitulo"
        ).textContent = resultado.titulo;


        const lista =
            document.getElementById("resultadoPassos");


        lista.innerHTML = "";


        resultado.passos.forEach(function(passo) {

            const item =
                document.createElement("li");

            item.textContent = passo;

            lista.appendChild(item);

        });


        document.getElementById(
            "resultadoExcecao"
        ).textContent = resultado.excecao;


        document.getElementById(
            "resultadoRisco"
        ).textContent = resultado.risco;

        const recomendacao =
    document.getElementById(
        "resultadoRecomendacao"
    );

        if (recomendacao) {

            recomendacao.textContent =
                resultado.recomendacao || "";

        }

        document.getElementById("resultadoRecomendacao").textContent = resultado.recomendacao;


        document.getElementById("registro")
            .style.display = "none";


        document.getElementById("resultado")
            .style.display = "block";


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível conectar com a IA.\n\n" +
            erro.message
        );


    } finally {

        botao.disabled = false;

        botao.textContent =
            "🧠 Analisar com IA";

    }

}

async function salvarConhecimento() {

    if (!resultadoConhecimentoAtual) {

        alert(
            "Primeiro analise o conhecimento com a IA."
        );

        return;

    }


    const conhecimentoOriginal =
        document.getElementById(
            "conhecimento"
        ).value;


    const botao =
        document.querySelector(
            "#resultado .botao-principal"
        );


    try {

        if (botao) {

            botao.disabled = true;

            botao.textContent =
                "💾 Salvando...";

        }


        const resposta =
            await fetch(
                "/salvar-conhecimento",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        titulo:
                            resultadoConhecimentoAtual.titulo,

                        conhecimento_original:
                            conhecimentoOriginal,

                        passos:
                            resultadoConhecimentoAtual.passos,

                        excecao:
                            resultadoConhecimentoAtual.excecao,

                        risco:
                            resultadoConhecimentoAtual.risco,

                        recomendacao:
                            resultadoConhecimentoAtual.recomendacao,

                        especialista:
                            "Gabryel"

                    })

                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                "Erro ao salvar."
            );

        }


        alert(
            "✓ Conhecimento salvo na memória!"
        );


        atualizarDashboard();


        abrirBaseConhecimentos();


    } catch (erro) {

        console.error(erro);


        alert(
            "Erro ao salvar conhecimento:\n\n" +
            erro.message
        );


    } finally {

        if (botao) {

            botao.disabled = false;

            botao.textContent =
                "✓ Salvar na memória";

        }

    }

}

function consultarMemoria(
    processoId,
    tituloProcesso
) {

    processoSelecionado = {

        id:
            processoId,

        titulo:
            tituloProcesso

    };


    const titulo =
        document.getElementById(
            "tituloProcessoPergunta"
        );


    if (titulo) {

        titulo.textContent =
            tituloProcesso;

    }


    const pergunta =
        document.getElementById(
            "perguntaTexto"
        );


    if (pergunta) {

        pergunta.value = "";

        pergunta.placeholder =
            "Ex: Qual o procedimento correto neste processo?";

    }


    const resposta =
        document.getElementById(
            "resposta"
        );


    if (resposta) {

        resposta.style.display =
            "none";

        resposta.innerHTML =
            "";

    }


    document.getElementById(
        "dashboard"
    ).style.display = "none";


    document.getElementById(
        "pergunta"
    ).style.display = "block";

}

async function responderPergunta() {

    const pergunta =
        document.getElementById(
            "perguntaTexto"
        ).value.trim();


    if (!pergunta) {

        alert(
            "Digite uma pergunta."
        );

        return;

    }


    if (!processoSelecionado) {

        alert(
            "Nenhum processo foi selecionado."
        );

        return;

    }


    const resposta =
        document.getElementById(
            "resposta"
        );


    resposta.style.display =
        "block";


    resposta.textContent =
        "🧠 Consultando a memória deste processo...";


    try {

        const requisicao =
            await fetch(
                "/perguntar",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        pergunta:
                            pergunta,

                        processo_id:
                            processoSelecionado.id

                    })

                }
            );


        const resultado =
            await requisicao.json();


        if (!requisicao.ok) {

            throw new Error(
                resultado.erro ||
                "Erro ao consultar memória."
            );

        }


        resposta.innerHTML = "";


        const cabecalho =
            document.createElement(
                "strong"
            );


        cabecalho.textContent =
            "🤖 Memória Viva";


        resposta.appendChild(
            cabecalho
        );


        const processo =
            document.createElement(
                "p"
            );


        processo.style.marginTop =
            "8px";


        processo.innerHTML =
            "<strong>Processo:</strong> " +
            escaparHTML(
                resultado.processo
            );


        resposta.appendChild(
            processo
        );


        const texto =
            document.createElement(
                "p"
            );


        texto.style.marginTop =
            "12px";


        texto.style.whiteSpace =
            "pre-line";


        texto.textContent =
            resultado.resposta;


        resposta.appendChild(
            texto
        );


        if (
            resultado.fontes &&
            resultado.fontes.length
        ) {

            const fonte =
                document.createElement(
                    "div"
                );


            fonte.style.marginTop =
                "16px";


            fonte.innerHTML =
                "<strong>Fontes consultadas:</strong>";


            const lista =
                document.createElement(
                    "ul"
                );


            resultado.fontes.forEach(
                function(item) {

                    const li =
                        document.createElement(
                            "li"
                        );


                    li.textContent =
                        item;


                    lista.appendChild(
                        li
                    );

                }
            );


            fonte.appendChild(
                lista
            );


            resposta.appendChild(
                fonte
            );

        }


    } catch (erro) {

        console.error(
            erro
        );


        resposta.textContent =
            "❌ Não foi possível consultar a memória.\n\n" +
            erro.message;

    }

}

function gravarAudio() {

    alert(
        "🎙️ A gravação de áudio será ativada na próxima etapa."
    );

}

async function carregarProcessos() {

    const container =
        document.getElementById(
            "listaProcessos"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        '<div class="estado-vazio">Carregando processos...</div>';


    try {

        const resposta =
            await fetch(
                "/processos"
            );


        const processos =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                processos.erro ||
                "Erro ao carregar processos."
            );

        }


        container.innerHTML = "";


        if (processos.length === 0) {

            container.innerHTML = `

                <div class="estado-vazio">

                    Ainda não existem processos
                    registrados.

                </div>

            `;

            return;

        }


        processos.forEach(
            function(processo) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "processo-card";


                const riscoClasse =
                    processo.nivel_risco
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(
                            /[\u0300-\u036f]/g,
                            ""
                        );


                card.innerHTML = `

                    <div class="processo-conteudo">

                        <span class="tag risco-${riscoClasse}">

                            RISCO ${processo.nivel_risco}

                        </span>


                        <h2>

                            ${escaparHTML(
                                processo.titulo
                            )}

                        </h2>


                        <p class="risco-processo">

                            <strong>Risco:</strong>

                            ${escaparHTML(
                                processo.risco
                            )}

                        </p>


                        <div class="concentracao">

                            <div class="concentracao-topo">

                                <span>
                                    Concentração do conhecimento
                                </span>

                                <strong>
                                    ${processo.concentracao}%
                                </strong>

                            </div>


                            <div class="barra-concentracao">

                                <div
                                    class="barra-concentracao-preenchida"
                                    style="width:${processo.concentracao}%">

                                </div>

                            </div>


                            <small>

                                Estimativa ilustrativa
                                para o protótipo.

                            </small>

                        </div>


                        <p class="quantidade-conhecimentos">

                            ${processo.quantidade_conhecimentos}

                            conhecimento(s) registrado(s)

                        </p>

                    </div>


                    <div class="processo-acoes">

                        <button
                            class="botao-consultar"
                            onclick="consultarMemoria(
                                ${processo.id},
                                '${escaparJS(
                                    processo.titulo
                                )}'
                            )">

                            🧠 Consultar a Base OMNI

                        </button>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


    } catch (erro) {

        console.error(
            erro
        );


        container.innerHTML = `

            <div class="estado-erro">

                ❌ Não foi possível carregar
                os processos.

            </div>

        `;

    }

}

function escaparHTML(texto) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto ?? "";


    return div.innerHTML;

}

function escaparJS(texto) {

    return String(
        texto ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /\r?\n/g,
            "\\n"
        );

}

function abrirBaseConhecimentos() {

    document.getElementById(
        "dashboard"
    ).style.display = "none";


    document.getElementById(
        "registro"
    ).style.display = "none";


    document.getElementById(
        "resultado"
    ).style.display = "none";


    document.getElementById(
        "pergunta"
    ).style.display = "none";


    document.getElementById(
        "baseConhecimentos"
    ).style.display = "block";


    carregarConhecimentos();

}

async function carregarConhecimentos(
    busca = ""
) {

    const container =
        document.getElementById(
            "listaConhecimentos"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        '<div class="estado-vazio">Carregando conhecimentos...</div>';


    try {

        const url =
            busca
                ? `/conhecimentos?busca=${encodeURIComponent(busca)}`
                : "/conhecimentos";


        const resposta =
            await fetch(
                url
            );


        const conhecimentos =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                conhecimentos.erro ||
                "Erro ao carregar conhecimentos."
            );

        }


        container.innerHTML = "";


        if (
            conhecimentos.length === 0
        ) {

            container.innerHTML = `

                <div class="estado-vazio">

                    Nenhum conhecimento encontrado.

                </div>

            `;

            return;

        }


        conhecimentos.forEach(
            function(conhecimento) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "conhecimento-card";


                card.innerHTML = `

                    <div>

                        <span class="tag">

                            CONHECIMENTO

                        </span>


                        <h2>

                            ${escaparHTML(
                                conhecimento.titulo
                            )}

                        </h2>


                        <p>

                            <strong>
                                Processo:
                            </strong>

                            ${escaparHTML(
                                conhecimento.processo
                            )}

                        </p>


                        <p>

                            <strong>
                                Especialista:
                            </strong>

                            ${escaparHTML(
                                conhecimento.especialista
                            )}

                        </p>


                        <p>

                            <strong>
                                Risco:
                            </strong>

                            ${escaparHTML(
                                conhecimento.risco ||
                                "Não informado"
                            )}

                        </p>


                        <p class="data-conhecimento">

                            Registrado em
                            ${escaparHTML(
                                conhecimento.criado_em
                            )}

                        </p>

                    </div>


                    <div class="conhecimento-acoes">

                        <button
                            class="botao-secundario"
                            onclick="verConhecimento(
                                ${conhecimento.id}
                            )">

                            Ver conhecimento

                        </button>


                        <button
                            class="botao-consultar"
                            onclick="consultarMemoria(
                                ${conhecimento.processo ? conhecimento.id : 0},
                                '${escaparJS(
                                    conhecimento.processo
                                )}'
                            )">

                            🧠 Consultar

                        </button>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


    } catch (erro) {

        console.error(
            erro
        );


        container.innerHTML = `

            <div class="estado-erro">

                ❌ Erro ao carregar a Base
                de Conhecimentos.

            </div>

        `;

    }

}

function buscarConhecimentos() {

    const campo =
        document.getElementById(
            "campoBuscaConhecimentos"
        );


    const busca =
        campo.value.trim();


    carregarConhecimentos(
        busca
    );

}

const campoBusca =
    document.getElementById(
        "campoBuscaConhecimentos"
    );


if (campoBusca) {

    campoBusca.addEventListener(
        "keydown",
        function(evento) {

            if (
                evento.key === "Enter"
            ) {

                buscarConhecimentos();

            }

        }
    );

}

async function verConhecimento(
    id
) {

    try {

        const resposta =
            await fetch(
                "/conhecimentos"
            );


        const conhecimentos =
            await resposta.json();


        const conhecimento =
            conhecimentos.find(
                function(item) {

                    return item.id === id;

                }
            );


        if (!conhecimento) {

            alert(
                "Conhecimento não encontrado."
            );

            return;

        }


        alert(

            "📚 " +
            conhecimento.titulo +

            "\n\n" +

            "Processo: " +
            conhecimento.processo +

            "\n\n" +

            "Especialista: " +
            conhecimento.especialista +

            "\n\n" +

            "Risco: " +
            conhecimento.risco +

            "\n\n" +

            "Procedimento:\n" +

            conhecimento.passos
                .map(
                    (passo, indice) =>
                        `${indice + 1}. ${passo}`
                )
                .join("\n") +

            "\n\n" +

            "Exceção:\n" +
            conhecimento.excecao +

            "\n\n" +

            "Recomendação:\n" +
            conhecimento.recomendacao

        );


    } catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao consultar conhecimento."
        );

    }

}

function abrirPerguntaGeral() {

    processoSelecionado = null;


    document.getElementById(
        "dashboard"
    ).style.display = "none";


    document.getElementById(
        "pergunta"
    ).style.display = "block";


    const titulo =
        document.getElementById(
            "tituloProcessoPergunta"
        );


    if (titulo) {

        titulo.textContent =
            "Consulta geral";

    }


    const pergunta =
        document.getElementById(
            "perguntaTexto"
        );


    pergunta.value = "";


    pergunta.placeholder =
        "A consulta geral será liberada na próxima evolução.";

}

async function atualizarDashboard() {

    await atualizarEstatisticas();

    await carregarProcessos();

}

async function atualizarEstatisticas() {

    try {

        const resposta =
            await fetch(
                "/estatisticas"
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro nas estatísticas."
            );

        }


        document.getElementById(
            "totalConhecimentos"
        ).textContent =
            dados.conhecimentos;


        document.getElementById(
            "totalProcessos"
        ).textContent =
            dados.processos;


        document.getElementById(
            "totalRiscos"
        ).textContent =
            dados.riscos;


    } catch (erro) {

        console.error(
            erro
        );

    }

}

document.addEventListener(
    "DOMContentLoaded",
    function() {

        atualizarDashboard();

    }
);

/* CONTADOR DE CARACTERES */

const campoConhecimento =
    document.getElementById("conhecimento");

const contador =
    document.getElementById("contador");


if (campoConhecimento) {

    campoConhecimento.addEventListener(
        "input",
        function() {

            contador.textContent =
                this.value.length + " caracteres";

        }
    );

}

// ================================
// GRAVAÇÃO DE EXPERIÊNCIA
// ================================

let gravador;
let partesAudio = [];
let audioGravado = null;

const btnGravar = document.getElementById("btnGravar");
const statusGravacao = document.getElementById("statusGravacao");


btnGravar.addEventListener("click", async function () {

    // COMEÇAR GRAVAÇÃO
    if (!gravador || gravador.state === "inactive") {

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            partesAudio = [];

            gravador =
                new MediaRecorder(stream);

            gravador.ondataavailable = function (evento) {

                if (evento.data.size > 0) {
                    partesAudio.push(evento.data);
                }

            };


            gravador.onstop = function () {

                audioGravado =
                    new Blob(
                        partesAudio,
                        { type: "audio/webm" }
                    );

                stream.getTracks().forEach(
                    track => track.stop()
                );

                statusGravacao.textContent =
                    "✅ Gravação pronta para análise.";

            };


            gravador.start();

            btnGravar.textContent =
                "⏹️ Parar gravação";

            statusGravacao.textContent =
                "🔴 Gravando... fale sua experiência.";

        } catch (erro) {

            console.error(erro);

            alert(
                "Não foi possível acessar o microfone."
            );

        }

    }

    // PARAR GRAVAÇÃO
    else {

        gravador.stop();

        btnGravar.textContent =
            "🎙️ Gravar novamente";

    }

});

async function analisarAudio() {

    if (!audioGravado) {

        alert(
            "Primeiro grave sua experiência."
        );

        return;

    }


    statusGravacao.textContent =
        "🧠 A IA está analisando sua experiência...";


    const dados = new FormData();

    dados.append(
        "audio",
        audioGravado,
        "experiencia.webm"
    );


    try {

        const resposta = await fetch(
            "/analisar-audio",
            {
                method: "POST",
                body: dados
            }
        );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                "Erro ao analisar o áudio."
            );

        }


        console.log(
            "Resultado da IA:",
            resultado
        );


        // Coloca o texto transcrito no campo
        const campo =
            document.getElementById(
                "conhecimento"
            );


        if (campo) {

            campo.value =
                resultado.transcricao;

        }


        statusGravacao.textContent =
            "✅ Experiência transformada em texto pela IA.";

    } catch (erro) {

        console.error(erro);

        statusGravacao.textContent =
            "❌ Erro ao analisar áudio.";

        alert(
            "Erro ao enviar o áudio:\n\n" +
            erro.message
        );

    }

}

async function atualizarEstatisticas() {

    try {

        const resposta = await fetch(
            "/estatisticas"
        );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar estatísticas."
            );

        }


        document.getElementById(
            "totalConhecimentos"
        ).textContent =
            dados.conhecimentos;


        document.getElementById(
            "totalProcessos"
        ).textContent =
            dados.processos;


        document.getElementById(
            "totalRiscos"
        ).textContent =
            dados.riscos;


    } catch (erro) {

        console.error(
            "Erro nas estatísticas:",
            erro
        );

    }

}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        atualizarEstatisticas();

    }
);