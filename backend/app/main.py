import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import engine, Base
from . import models

# Ensure all database tables exist on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ticket Management API", version="1.0.0")

# Import routers
from .routers import tickets, ticket_types

# Include routers
app.include_router(ticket_types.router)
app.include_router(tickets.router)

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Ticket Management API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

