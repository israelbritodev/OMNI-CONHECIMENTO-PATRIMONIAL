from flask import Flask, request, jsonify, send_from_directory
from google import genai
import json
import sqlite3
from datetime import datetime


# =========================================================
# CONFIGURAÇÃO
# =========================================================

app = Flask(__name__)

client = genai.Client()

DATABASE = "memoria.db"


# =========================================================
# BANCO
# =========================================================

def conectar_banco():

    conexao = sqlite3.connect(DATABASE)

    conexao.row_factory = sqlite3.Row

    return conexao


def concentracao_ficticia(id_processo):

    # Percentual APENAS para demonstração do protótipo.
    # Gera valores estáveis entre 65% e 95%.

    return 65 + ((id_processo * 13) % 31)


def classificar_risco(texto):

    texto = (texto or "").lower()

    palavras_altas = [
        "alto",
        "grave",
        "crítico",
        "critico",
        "acidente",
        "elétrico",
        "eletrico",
        "morte",
        "lesão",
        "lesao",
        "incêndio",
        "incendio"
    ]

    palavras_medias = [
        "médio",
        "medio",
        "atenção",
        "atencao",
        "falha",
        "perigo",
        "cuidado"
    ]

    if any(
        palavra in texto
        for palavra in palavras_altas
    ):

        return "ALTO"


    if any(
        palavra in texto
        for palavra in palavras_medias
    ):

        return "MÉDIO"


    return "BAIXO"


# =========================================================
# INICIALIZAÇÃO DO BANCO
# =========================================================

def inicializar_banco():

    conexao = conectar_banco()

    cursor = conexao.cursor()


    # -----------------------------------------------------
    # PROCESSOS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS processos (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            titulo TEXT NOT NULL UNIQUE,

            risco TEXT,

            concentracao_percentual INTEGER,

            criado_em TEXT NOT NULL

        )
    """)


    # -----------------------------------------------------
    # CONHECIMENTOS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conhecimentos (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            titulo TEXT NOT NULL,

            conhecimento_original TEXT,

            passos TEXT,

            excecao TEXT,

            risco TEXT,

            recomendacao TEXT,

            especialista TEXT,

            processo_id INTEGER,

            criado_em TEXT NOT NULL,

            FOREIGN KEY (processo_id)
                REFERENCES processos(id)

        )
    """)


    # -----------------------------------------------------
    # MIGRAÇÃO DA VERSÃO ANTERIOR
    # -----------------------------------------------------

    cursor.execute("""
        PRAGMA table_info(conhecimentos)
    """)

    colunas = [
        coluna["name"]
        for coluna in cursor.fetchall()
    ]


    # Se o banco antigo existir sem processo_id,
    # adicionamos a coluna.

    if "processo_id" not in colunas:

        cursor.execute("""
            ALTER TABLE conhecimentos
            ADD COLUMN processo_id INTEGER
        """)


    conexao.commit()


    # -----------------------------------------------------
    # TRANSFORMA REGISTROS ANTIGOS EM PROCESSOS
    # -----------------------------------------------------

    cursor.execute("""
        SELECT *
        FROM conhecimentos
        WHERE processo_id IS NULL
    """)

    registros_antigos = cursor.fetchall()


    for registro in registros_antigos:

        titulo_processo = (
            registro["titulo"]
            or "Processo sem título"
        )


        cursor.execute("""
            SELECT id
            FROM processos
            WHERE titulo = ?
        """, (
            titulo_processo,
        ))


        processo = cursor.fetchone()


        if processo:

            processo_id = processo["id"]


        else:

            cursor.execute("""
                INSERT INTO processos
                (
                    titulo,
                    risco,
                    concentracao_percentual,
                    criado_em
                )

                VALUES (?, ?, ?, ?)
            """, (

                titulo_processo,

                registro["risco"],

                0,

                datetime.now().strftime(
                    "%d/%m/%Y %H:%M"
                )

            ))


            processo_id = cursor.lastrowid


            percentual = concentracao_ficticia(
                processo_id
            )


            cursor.execute("""
                UPDATE processos

                SET concentracao_percentual = ?

                WHERE id = ?
            """, (

                percentual,

                processo_id

            ))


        cursor.execute("""
            UPDATE conhecimentos

            SET processo_id = ?

            WHERE id = ?
        """, (

            processo_id,

            registro["id"]

        ))


    conexao.commit()


    conexao.close()


inicializar_banco()


# =========================================================
# PÁGINA PRINCIPAL
# =========================================================

@app.route("/")
def inicio():

    return send_from_directory(
        ".",
        "index.html"
    )


@app.route("/<path:arquivo>")
def arquivos(arquivo):

    return send_from_directory(
        ".",
        arquivo
    )


# =========================================================
# ANALISAR CONHECIMENTO
# =========================================================

@app.route(
    "/analisar",
    methods=["POST"]
)
def analisar():

    try:

        dados = request.get_json()

        titulo = dados.get(
            "titulo",
            ""
        )

        conhecimento = dados.get(
            "conhecimento",
            ""
        )


        if not conhecimento.strip():

            return jsonify({
                "erro":
                    "Nenhum conhecimento foi enviado."
            }), 400


        prompt = f"""

Você é a inteligência artificial do sistema
OMNI CONHECIMENTO PATRIMONIAL.

O objetivo é transformar a experiência dos
funcionários em conhecimento estruturado.

Analise:

TÍTULO:
{titulo}

EXPERIÊNCIA:
{conhecimento}

Identifique:

1. Um título adequado.
2. Os passos principais.
3. Exceções.
4. Riscos.
5. Uma recomendação.

Responda SOMENTE em JSON válido:

{{
    "titulo": "título",

    "passos": [
        "passo 1",
        "passo 2",
        "passo 3"
    ],

    "excecao": "exceção",

    "risco": "risco",

    "recomendacao": "recomendação"
}}

Não coloque markdown.
Não coloque explicações.

"""


        chat = client.chats.create(
            model="gemini-3.6-flash"
        )


        resposta = chat.send_message(
            prompt
        )


        texto = resposta.text.strip()

        texto = texto.replace(
            "```json",
            ""
        )

        texto = texto.replace(
            "```",
            ""
        )

        texto = texto.strip()


        resultado = json.loads(
            texto
        )


        return jsonify(
            resultado
        )


    except Exception as erro:

        print(
            "ERRO:",
            erro
        )


        return jsonify({
            "erro":
                str(erro)
        }), 500


# =========================================================
# ÁUDIO
# =========================================================

@app.route(
    "/analisar-audio",
    methods=["POST"]
)
def analisar_audio():

    try:

        arquivo = request.files.get(
            "audio"
        )


        if not arquivo:

            return jsonify({
                "erro":
                    "Nenhum áudio foi enviado."
            }), 400


        caminho = "experiencia.webm"

        arquivo.save(
            caminho
        )


        arquivo_gemini = client.files.upload(
            file=caminho
        )


        prompt = """

Você é a inteligência artificial do sistema
OMNI CONHECIMENTO PATRIMONIAL.

Transcreva fielmente o áudio.

Responda SOMENTE:

{
    "transcricao": "texto"
}

"""


        resposta = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=[
                prompt,
                arquivo_gemini
            ]

        )


        texto = resposta.text.strip()

        texto = texto.replace(
            "```json",
            ""
        )

        texto = texto.replace(
            "```",
            ""
        )

        texto = texto.strip()


        resultado = json.loads(
            texto
        )


        return jsonify(
            resultado
        )


    except Exception as erro:

        print(
            "ERRO NO ÁUDIO:",
            erro
        )


        return jsonify({
            "erro":
                str(erro)
        }), 500


# =========================================================
# SALVAR CONHECIMENTO
# =========================================================

@app.route(
    "/salvar-conhecimento",
    methods=["POST"]
)
def salvar_conhecimento():

    try:

        dados = request.get_json()


        titulo = dados.get(
            "titulo",
            ""
        ).strip()


        conhecimento_original = dados.get(
            "conhecimento_original",
            ""
        ).strip()


        passos = dados.get(
            "passos",
            []
        )


        excecao = dados.get(
            "excecao",
            ""
        ).strip()


        risco = dados.get(
            "risco",
            ""
        ).strip()


        recomendacao = dados.get(
            "recomendacao",
            ""
        ).strip()


        especialista = dados.get(
            "especialista",
            "Gabryel"
        ).strip()


        if not titulo:

            return jsonify({
                "erro":
                    "O título é obrigatório."
            }), 400


        conexao = conectar_banco()

        cursor = conexao.cursor()


        # -------------------------------------------------
        # PROCURA OU CRIA O PROCESSO
        # -------------------------------------------------

        cursor.execute("""
            SELECT *
            FROM processos
            WHERE titulo = ?
        """, (
            titulo,
        ))


        processo = cursor.fetchone()


        if processo:

            processo_id = processo["id"]


            # Atualiza risco do processo
            # caso um novo conhecimento traga
            # uma informação de risco.

            cursor.execute("""
                UPDATE processos

                SET risco = ?

                WHERE id = ?
            """, (

                risco,

                processo_id

            ))


        else:

            cursor.execute("""
                INSERT INTO processos
                (
                    titulo,
                    risco,
                    concentracao_percentual,
                    criado_em
                )

                VALUES (?, ?, ?, ?)
            """, (

                titulo,

                risco,

                0,

                datetime.now().strftime(
                    "%d/%m/%Y %H:%M"
                )

            ))


            processo_id = cursor.lastrowid


            percentual = concentracao_ficticia(
                processo_id
            )


            cursor.execute("""
                UPDATE processos

                SET concentracao_percentual = ?

                WHERE id = ?
            """, (

                percentual,

                processo_id

            ))


        # -------------------------------------------------
        # SALVA CONHECIMENTO
        # -------------------------------------------------

        cursor.execute("""
            INSERT INTO conhecimentos
            (
                titulo,
                conhecimento_original,
                passos,
                excecao,
                risco,
                recomendacao,
                especialista,
                processo_id,
                criado_em
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (

            titulo,

            conhecimento_original,

            json.dumps(
                passos,
                ensure_ascii=False
            ),

            excecao,

            risco,

            recomendacao,

            especialista,

            processo_id,

            datetime.now().strftime(
                "%d/%m/%Y %H:%M"
            )

        ))


        conhecimento_id = cursor.lastrowid


        conexao.commit()

        conexao.close()


        return jsonify({

            "sucesso":
                True,

            "id":
                conhecimento_id,

            "processo_id":
                processo_id,

            "mensagem":
                "Conhecimento salvo na memória."

        })


    except Exception as erro:

        print(
            "ERRO AO SALVAR:",
            erro
        )


        return jsonify({
            "erro":
                str(erro)
        }), 500


# =========================================================
# ESTATÍSTICAS
# =========================================================

@app.route(
    "/estatisticas",
    methods=["GET"]
)
def estatisticas():

    try:

        conexao = conectar_banco()

        cursor = conexao.cursor()


        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM conhecimentos
        """)

        conhecimentos = cursor.fetchone()["total"]


        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM processos
        """)

        processos = cursor.fetchone()["total"]


        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM processos
            WHERE UPPER(risco) LIKE '%ALTO%'
        """)

        riscos = cursor.fetchone()["total"]


        conexao.close()


        return jsonify({

            "conhecimentos":
                conhecimentos,

            "processos":
                processos,

            "riscos":
                riscos

        })


    except Exception as erro:

        return jsonify({
            "erro":
                str(erro)
        }), 500


# =========================================================
# PROCESSOS DO DASHBOARD
# =========================================================

@app.route(
    "/processos",
    methods=["GET"]
)
def listar_processos():

    try:

        conexao = conectar_banco()

        cursor = conexao.cursor()


        cursor.execute("""
            SELECT
                p.id,
                p.titulo,
                p.risco,
                p.concentracao_percentual,
                p.criado_em,

                COUNT(k.id) AS quantidade_conhecimentos

            FROM processos p

            LEFT JOIN conhecimentos k
                ON k.processo_id = p.id

            GROUP BY p.id

            ORDER BY p.id DESC
        """)


        registros = cursor.fetchall()


        conexao.close()


        processos = []


        for registro in registros:

            risco_texto = (
                registro["risco"]
                or "Não classificado"
            )


            processos.append({

                "id":
                    registro["id"],

                "titulo":
                    registro["titulo"],

                "risco":
                    risco_texto,

                "nivel_risco":
                    classificar_risco(
                        risco_texto
                    ),

                "concentracao":
                    registro[
                        "concentracao_percentual"
                    ],

                "quantidade_conhecimentos":
                    registro[
                        "quantidade_conhecimentos"
                    ],

                "criado_em":
                    registro["criado_em"]

            })


        return jsonify(
            processos
        )


    except Exception as erro:

        print(
            "ERRO PROCESSOS:",
            erro
        )


        return jsonify({
            "erro":
                str(erro)
        }), 500


# =========================================================
# BASE DE CONHECIMENTOS
# =========================================================

@app.route(
    "/conhecimentos",
    methods=["GET"]
)
def listar_conhecimentos():

    try:

        conexao = conectar_banco()

        cursor = conexao.cursor()


        busca = request.args.get(
            "busca",
            ""
        ).strip()


        if busca:

            termo = f"%{busca}%"


            cursor.execute("""
                SELECT

                    k.*,

                    p.titulo AS processo_titulo,

                    p.concentracao_percentual

                FROM conhecimentos k

                LEFT JOIN processos p
                    ON p.id = k.processo_id

                WHERE

                    k.titulo LIKE ?

                    OR k.conhecimento_original LIKE ?

                    OR k.risco LIKE ?

                    OR k.recomendacao LIKE ?

                    OR p.titulo LIKE ?

                ORDER BY k.id DESC

            """, (

                termo,
                termo,
                termo,
                termo,
                termo

            ))


        else:

            cursor.execute("""
                SELECT

                    k.*,

                    p.titulo AS processo_titulo,

                    p.concentracao_percentual

                FROM conhecimentos k

                LEFT JOIN processos p
                    ON p.id = k.processo_id

                ORDER BY k.id DESC
            """)


        registros = cursor.fetchall()


        conexao.close()


        resultado = []


        for registro in registros:

            resultado.append({

                "id":
                    registro["id"],

                "titulo":
                    registro["titulo"],

                "processo":
                    registro["processo_titulo"]
                    or registro["titulo"],

                "conhecimento":
                    registro[
                        "conhecimento_original"
                    ],

                "passos":
                    json.loads(
                        registro["passos"]
                        or "[]"
                    ),

                "excecao":
                    registro["excecao"],

                "risco":
                    registro["risco"],

                "recomendacao":
                    registro["recomendacao"],

                "especialista":
                    registro["especialista"],

                "criado_em":
                    registro["criado_em"],

                "concentracao":
                    registro[
                        "concentracao_percentual"
                    ]

            })


        return jsonify(
            resultado
        )


    except Exception as erro:

        return jsonify({
            "erro":
                str(erro)
        }), 500


# =========================================================
# PERGUNTAR À MEMÓRIA
# =========================================================

@app.route(
    "/perguntar",
    methods=["POST"]
)
def perguntar():

    try:

        dados = request.get_json()


        pergunta = dados.get(
            "pergunta",
            ""
        ).strip()


        processo_id = dados.get(
            "processo_id"
        )


        if not pergunta:

            return jsonify({
                "erro":
                    "Digite uma pergunta."
            }), 400


        if not processo_id:

            return jsonify({
                "erro":
                    "Selecione um processo."
            }), 400


        conexao = conectar_banco()

        cursor = conexao.cursor()


        # -------------------------------------------------
        # GARANTE QUE O PROCESSO EXISTE
        # -------------------------------------------------

        cursor.execute("""
            SELECT *
            FROM processos
            WHERE id = ?
        """, (
            processo_id,
        ))


        processo = cursor.fetchone()


        if not processo:

            conexao.close()


            return jsonify({
                "erro":
                    "Processo não encontrado."
            }), 404


        # -------------------------------------------------
        # BUSCA SOMENTE DENTRO DO PROCESSO
        # -------------------------------------------------

        palavras = pergunta.split()


        palavras = [

            palavra.strip(
                ".,!?;:()[]{}"
            )

            for palavra in palavras

            if len(
                palavra.strip(
                    ".,!?;:()[]{}"
                )
            ) >= 3

        ]


        registros = []


        if palavras:

            condicoes = []

            parametros = []


            for palavra in palavras:

                condicoes.append("""
                    (
                        k.titulo LIKE ?
                        OR k.conhecimento_original LIKE ?
                        OR k.excecao LIKE ?
                        OR k.risco LIKE ?
                        OR k.recomendacao LIKE ?
                    )
                """)


                termo = f"%{palavra}%"


                parametros.extend([

                    termo,
                    termo,
                    termo,
                    termo,
                    termo

                ])


            consulta = """

                SELECT k.*

                FROM conhecimentos k

                WHERE

                    k.processo_id = ?

                    AND (

            """ + " OR ".join(condicoes) + """

                    )

                ORDER BY k.id DESC

                LIMIT 8

            """


            cursor.execute(

                consulta,

                [
                    processo_id,
                    *parametros
                ]

            )


            registros = cursor.fetchall()


        # -------------------------------------------------
        # SE A BUSCA POR PALAVRAS NÃO ENCONTRAR,
        # PEGA OS CONHECIMENTOS DO PROCESSO
        # -------------------------------------------------

        if not registros:

            cursor.execute("""
                SELECT *

                FROM conhecimentos

                WHERE processo_id = ?

                ORDER BY id DESC

                LIMIT 8

            """, (
                processo_id,
            ))


            registros = cursor.fetchall()


        conexao.close()


        if not registros:

            return jsonify({

                "resposta":
                    "Ainda não existe conhecimento suficiente registrado para este processo.",

                "processo":
                    processo["titulo"],

                "fontes":
                    []

            })


        # -------------------------------------------------
        # MONTA O CONTEXTO
        # -------------------------------------------------

        contexto = ""


        for registro in registros:

            passos = json.loads(
                registro["passos"]
                or "[]"
            )


            contexto += f"""

CONHECIMENTO #{registro["id"]}

Processo:
{processo["titulo"]}

Título:
{registro["titulo"]}

Especialista:
{registro["especialista"]}

Experiência:
{registro["conhecimento_original"]}

Passos:
{chr(10).join(
    "- " + passo
    for passo in passos
)}

Exceção:
{registro["excecao"]}

Risco:
{registro["risco"]}

Recomendação:
{registro["recomendacao"]}

--------------------------------

"""


        # -------------------------------------------------
        # IA RESTRITA AO PROCESSO
        # -------------------------------------------------

        prompt = f"""

Você é a Memória Viva do sistema
OMNI CONHECIMENTO PATRIMONIAL.

O funcionário está consultando especificamente
o processo:

{processo["titulo"]}

IMPORTANTE:

Você só pode responder usando os conhecimentos
registrados para ESTE processo.

Não utilize conhecimentos de outros processos.

Não invente procedimentos.

Se a informação não estiver suficientemente
registrada para este processo, diga:

"Não encontrei informação suficiente registrada
neste processo."

PERGUNTA:

{pergunta}

CONHECIMENTOS DO PROCESSO:

{contexto}

Responda em português do Brasil.

Seja objetivo.

Quando possível, mencione a fonte do conhecimento.
"""


        resposta = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=prompt

        )


        texto = resposta.text.strip()


        fontes = [

            f'{registro["titulo"]} — '
            f'{registro["especialista"]}'

            for registro in registros

        ]


        return jsonify({

            "resposta":
                texto,

            "processo":
                processo["titulo"],

            "fontes":
                fontes

        })


    except Exception as erro:

        print(
            "ERRO PERGUNTA:",
            erro
        )


        return jsonify({
            "erro":
                str(erro)
        }), 500


# =========================================================
# EXECUÇÃO
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )