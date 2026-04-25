from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import brand, detect, ledger, report

app = FastAPI(title="PhishGuardX Core Backend", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detect.router, prefix="/api/detect", tags=["detect"])
app.include_router(report.router, prefix="/api/report", tags=["report"])
app.include_router(ledger.router, prefix="/api/ledger", tags=["ledger"])
app.include_router(brand.router, prefix="/api", tags=["brand"])


@app.get("/")
def read_root():
    return {"message": "PhishGuardX core API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
