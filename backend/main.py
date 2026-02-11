from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import federated, updates

app = FastAPI(title="Phishing Detector Backend", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(federated.router, prefix="/api/federated", tags=["federated"])
app.include_router(updates.router, prefix="/api/updates", tags=["updates"])

@app.get("/")
def read_root():
    return {"message": "Phishing Detector Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
