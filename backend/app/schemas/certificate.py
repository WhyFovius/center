from datetime import date

from pydantic import BaseModel


class CertificateOut(BaseModel):
    available: bool
    certificate_id: str | None
    issue_date: date | None
    qr_payload: str | None
    message: str
