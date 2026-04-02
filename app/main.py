from collections import defaultdict
from contextlib import asynccontextmanager
import logging
import sys
from time import time as _time
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import settings
from app.db import init_db
from app.routes import analysis, auth, misc, payment, tracking


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        logger.info(f"[{request_id}] {request.method} {request.url.path}")
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = {
    "/api/analyze": 10,
    "/api/payment/create": 15,
    "/api/payment/create-stripe": 15,
    "/api/generate-questions": 10,
    "/api/export": 30,
}
GLOBAL_RATE_LIMIT = 120


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self._global_requests = defaultdict(list)
        self._path_requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        now = _time()

        self._global_requests[client_ip] = [
            timestamp
            for timestamp in self._global_requests[client_ip]
            if now - timestamp < RATE_LIMIT_WINDOW
        ]
        path_key = (client_ip, path)
        self._path_requests[path_key] = [
            timestamp
            for timestamp in self._path_requests[path_key]
            if now - timestamp < RATE_LIMIT_WINDOW
        ]

        if len(self._global_requests[client_ip]) >= GLOBAL_RATE_LIMIT:
            logger.warning(f"Global rate limit exceeded: ip={client_ip} path={path}")
            return Response(
                content='{"detail":"Too many requests, please try again later."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": "60"},
            )

        path_limit = RATE_LIMIT_MAX.get(path)
        if path_limit is not None and len(self._path_requests[path_key]) >= path_limit:
            logger.warning(f"Path rate limit exceeded: ip={client_ip} path={path}")
            return Response(
                content='{"detail":"Too many requests, please try again later."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": "60"},
            )

        self._global_requests[client_ip].append(now)
        self._path_requests[path_key].append(now)
        return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="AI Job Search Platform API", lifespan=lifespan)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"[{request_id}] Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
        headers={"X-Request-ID": request_id},
    )


app.include_router(auth.router)
app.include_router(misc.router)
app.include_router(analysis.router)
app.include_router(payment.router)
app.include_router(tracking.router)
