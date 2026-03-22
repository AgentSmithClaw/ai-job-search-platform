from contextlib import asynccontextmanager
from collections import defaultdict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from app.config import settings
from app.db import init_db
import logging
import sys
import uuid
from time import time as _time

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

from app.routes import auth, analysis, misc, payment, tracking


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        logger.info(f"[{request_id}] {request.method} {request.url.path}")
        response = await call_next(request)
        response.headers['X-Request-ID'] = request_id
        return response


RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = {
    '/api/analyze': 10,
    '/api/payment/create': 15,
    '/api/payment/create-stripe': 15,
    '/api/generate-questions': 10,
    '/api/export': 30,
}
GLOBAL_RATE_LIMIT = 120


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self._requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else 'unknown'
        path = request.url.path
        now = _time()

        self._requests[client_ip] = [
            t for t in self._requests[client_ip] if now - t < RATE_LIMIT_WINDOW
        ]

        limit = RATE_LIMIT_MAX.get(path, GLOBAL_RATE_LIMIT)
        if len(self._requests[client_ip]) >= limit:
            logger.warning(f"Rate limit exceeded: ip={client_ip} path={path}")
            return Response(
                content='{"detail":"请求过于频繁，请稍后再试"}',
                status_code=429,
                media_type='application/json',
                headers={'Retry-After': '60'},
            )

        self._requests[client_ip].append(now)
        return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title='AI Job Search Platform API', lifespan=lifespan)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    request_id = getattr(request.state, 'request_id', 'unknown')
    logger.error(f"[{request_id}] Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={'detail': '服务器内部错误，请稍后重试'},
        headers={'X-Request-ID': request_id},
    )


app.include_router(auth.router)
app.include_router(misc.router)
app.include_router(analysis.router)
app.include_router(payment.router)
app.include_router(tracking.router)


@app.get('/')
def root():
    from starlette.responses import HTMLResponse
    return HTMLResponse(_get_index_html())


@app.get('/{path:path}')
def serve_frontend(path: str):
    import os
    from starlette.responses import HTMLResponse
    # Serve assets if they exist
    for base in ['public', 'frontend/dist', '.']:
        file_path = os.path.join(base, path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
    # SPA fallback
    return HTMLResponse(_get_index_html())
