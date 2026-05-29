"""Research route: delegates to Phase 5 tools (laerio.db + bge-small + Qwen)."""
from __future__ import annotations

import sys
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel, Field

_P5 = Path(r"U:\Laerio\_scripts").resolve()
if str(_P5) not in sys.path:
    sys.path.insert(0, str(_P5))

router = APIRouter(prefix="/research", tags=["research"])


class FindBody(BaseModel):
    intent: str = Field(..., min_length=3)
    top_k: int = Field(default=20, ge=1, le=200)


class PitchBody(BaseModel):
    brand_id: str = Field(..., min_length=1)
    k: int = Field(default=5, ge=1, le=20)


@router.post("/find")
def research_find(body: FindBody) -> dict:
    from p5_rag import tools
    hits = tools.find_brands(intent=body.intent, top_k=body.top_k)
    return {"hits": hits, "count": len(hits), "intent": body.intent}


@router.post("/pitch")
def research_pitch(body: PitchBody) -> dict:
    from p5_rag import tools
    angles = tools.propose_pitch_angles(brand_id=body.brand_id, k=body.k)
    return {"brand_id": body.brand_id, "angles": angles, "count": len(angles)}
