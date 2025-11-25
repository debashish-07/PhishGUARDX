from fastapi import APIRouter

router = APIRouter()

@router.get("/check")
def check_for_updates(current_version: str):
    # Check if a new model version is available
    latest_version = "1.0.1"
    if current_version != latest_version:
        return {"update_available": True, "version": latest_version}
    return {"update_available": False}
