"""Configuration helpers for the multi-agent pipeline."""
from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv


def _to_bool(value: str, default: str = "false") -> bool:
    value = value if value is not None else default
    return value.lower() in {"1", "true", "yes", "on"}


# Load environment variables from a .env file if present.
load_dotenv()


@dataclass
class Settings:
    """Holds runtime configuration."""

    holistic_api_endpoint: str = os.getenv(
        "HOLISTIC_API_ENDPOINT",
        "https://ctwa92wg1b.execute-api.us-east-1.amazonaws.com/prod/invoke",
    )
    holistic_api_token: str = os.getenv("HOLISTIC_API_TOKEN", "")
    holistic_team_id: str = os.getenv("HOLISTIC_TEAM_ID", "")
    holistic_model_id: str = os.getenv(
        "HOLISTIC_MODEL_ID",
        "anthropic.claude-3-5-sonnet-20241022-v2:0",
    )

    valyu_api_key: str = os.getenv("VALYU_API_KEY", "")
    valyu_search_type: str = os.getenv("VALYU_SEARCH_TYPE", "all")
    valyu_max_results: int = int(os.getenv("VALYU_MAX_RESULTS", "5"))
    valyu_relevance_threshold: float = float(
        os.getenv("VALYU_RELEVANCE_THRESHOLD", "0.5")
    )
    valyu_max_price: float = float(os.getenv("VALYU_MAX_PRICE", "20.0"))
    valyu_fast_mode: bool = _to_bool(os.getenv("VALYU_FAST_MODE", "false"))
    valyu_start_date: str | None = os.getenv("VALYU_START_DATE")
    valyu_end_date: str | None = os.getenv("VALYU_END_DATE")
    valyu_response_length: str | None = os.getenv("VALYU_RESPONSE_LENGTH")
    valyu_country_code: str | None = os.getenv("VALYU_COUNTRY_CODE")
    valyu_included_sources: str | None = os.getenv("VALYU_INCLUDED_SOURCES")
    valyu_excluded_sources: str | None = os.getenv("VALYU_EXCLUDED_SOURCES")

    langsmith_api_key: str = os.getenv("LANGSMITH_API_KEY", "")
    langsmith_project: str = os.getenv("LANGSMITH_PROJECT", "multi-agent-pipeline")
    langsmith_endpoint: str = os.getenv(
        "LANGCHAIN_ENDPOINT",
        os.getenv("LANGSMITH_ENDPOINT", "https://api.smith.langchain.com"),
    )

    max_search_rounds: int = int(os.getenv("MAX_SEARCH_ROUNDS", "2"))
    max_logic_tokens: int = int(os.getenv("MAX_LOGIC_TOKENS", "4000"))
    json_indent: int = int(os.getenv("JSON_INDENT", "2"))

    @property
    def langsmith_enabled(self) -> bool:
        return bool(self.langsmith_api_key)


def configure_langsmith(settings: Settings) -> None:
    """Set LangSmith-specific env vars when credentials are provided."""

    if not settings.langsmith_enabled:
        return
    os.environ.setdefault("LANGCHAIN_TRACING_V2", "true")
    os.environ.setdefault("LANGCHAIN_ENDPOINT", settings.langsmith_endpoint)
    os.environ.setdefault("LANGCHAIN_PROJECT", settings.langsmith_project)
    os.environ.setdefault("LANGCHAIN_API_KEY", settings.langsmith_api_key)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
