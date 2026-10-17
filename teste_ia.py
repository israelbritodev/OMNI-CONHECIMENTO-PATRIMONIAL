from google import genai

client = genai.Client()

chat = client.chats.create(
    model="gemini-3.6-flash"
)

resposta = chat.send_message(
    "Responda exatamente: MEMÓRIA VIVA ESTÁ CONECTADA!"
)

print(resposta.text)