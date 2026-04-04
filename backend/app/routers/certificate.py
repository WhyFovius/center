from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.db.models import User
from backend.app.db.session import get_db
from backend.app.schemas.certificate import CertificateOut
from backend.app.services.certificate_service import build_certificate_payload
from backend.app.services.progress_service import get_or_create_progress, get_total_steps


router = APIRouter(prefix="/certificate", tags=["certificate"])


@router.get("/me", response_model=CertificateOut)
def my_certificate(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateOut:
    progress = get_or_create_progress(db, current_user.id)
    total_steps = get_total_steps(db)
    payload = build_certificate_payload(current_user, progress, total_steps)
    return CertificateOut(**payload)
