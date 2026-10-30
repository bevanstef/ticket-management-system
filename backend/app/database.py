"""Database configuration for the Ticket Management System.

This module creates the SQLAlchemy ``engine`` and a ``SessionLocal`` factory
that the FastAPI dependencies use.  The ``Base`` object is exported so that the
Core ``Table`` definitions in ``models.py`` can be attached to the same metadata
and ``Base.metadata.create_all(engine)`` works (if you ever run it manually).

The connection URL is taken from the ``DATABASE_URL`` environment variable –
the same variable you set in the ``.env`` file for Docker.  If the variable is
missing we fall back to the default Docker‑compose host name ``tms_db``.
"""

from __future__ import annotations

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load .env if present (Phase 1 already called load_dotenv in main, but we do it here
# for completeness when running scripts directly).
from dotenv import load_dotenv

load_dotenv()

# Default DB URL points to the Docker service name ``tms_db``.
DEFAULT_DB_URL = "postgresql+psycopg2://tms_user:tms_pass@tms_db:5432/ticket_management"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

# ``echo=False`` to keep the logs clean; set True while learning/debugging.
engine = create_engine(DATABASE_URL, echo=False, future=True)

# Session factory used by FastAPI dependencies.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for Core table definitions.
Base = declarative_base()

