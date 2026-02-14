import httpx
from fastapi import HTTPException, Query, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

INSTAGRAM_ACCESS_TOKEN = 'IGAAg9eyAQRgJBZAFo3cEMtWkk2MUhTNlBJV2pMei1LV3NlSERaMGhfQkVzamdrRGQ0Tlh5QjFGbVdxbldIa3VpRzRhMkx1R1dpVjkxY3VDbWQ2T0EwanZAtVWc4SHg1NHdOMGt6SWZAuMVR1Tm9kWEpHZAzJEUXBBWUtwcndmWV9DdwZDZD'
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello to Pedor Tatto Artist backend!"}

@app.get('/years-experience')
async def calculateYearsExperience():
    start = 2020
    now = datetime.now().year

    yearsExperience = now - start
    return yearsExperience

@app.get("/instagram-posts")
async def getIntagramPosts(limit: int = 10): # Função para obter posts do Instagram
    url = "https://graph.instagram.com/me/media"

    params = {
        "fields": "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url",
        "access_token": INSTAGRAM_ACCESS_TOKEN,
        "limit": limit,
    }

    resp = httpx.get(url, params=params)

    if resp.status_code != 200:
        print(f"Erro API: {resp.text}")
        raise HTTPException(status_code=resp.status_code, detail=resp.json())

    return resp.json()
'''
Enviar formulario de agendamento
Galeria de instagram -- FEITO
Segurança
Atualização automático de dados
'''
