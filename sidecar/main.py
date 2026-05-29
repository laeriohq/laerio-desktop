"""L'AERIO desktop sidecar. FastAPI on 127.0.0.1:5180.
Single owner of laerio.db reads from the desktop process."""
from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI


def build_app() -> FastAPI:
    app = FastAPI(title="L'AERIO HQ Core", version="0.1.0")
    from routes import health, brands, research  # type: ignore
    app.include_router(health.router)
    app.include_router(brands.router)
    app.include_router(research.router)
    return app


app = build_app()


def main() -> int:
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=int(os.environ.get("LAERIO_SIDECAR_PORT", "5180")),
        log_level="warning",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
