import requests
from fastapi import HTTPException, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

INSTAGRAM_ACCESS_TOKEN = 'IGAAg9eyAQRgJBZAGFMeXhaLU5WaDhKdURQa0J3NmNNdE1meTB4dXNwQkJPN0Y1bWZA4d3lRRWpHTk5yNFNjTjNFU281Y0xJXzRQUng0TzdxYkc0dWR6ZA3A1WGF3azFHWjN0THh6aHRBX3dqR0Q1aTJ5cHNEU3k4WnFvOXIxQXd1QQZDZD'

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
    return {"message": "Hello to Pedro Tatto Artist backend!"}


@app.get('/years-experience')
async def calculateYearsExperience():
    start = 2020
    now = datetime.now().year
    return now - start

#Ver como meto o get posts aqui usando o link que esta no frontend
