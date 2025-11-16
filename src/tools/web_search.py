"""Valyu search tool implemented with the official langchain-valyu client."""
from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List, Mapping, Optional

from langchain_valyu import ValyuSearchTool as LangChainValyuSearchTool

from ..config import Settings


def _csv_to_list(raw: Optional[str]) -> Optional[List[str]]:
    if not raw:
        return None
    values = [item.strip() for item in raw.split(",")]
    return [value for value in values if value]


class ValyuSearchTool:
    """Wraps the official Valyu tool and normalizes the output."""

    def __init__(self, settings: Settings):
        if not settings.valyu_api_key:
            raise RuntimeError("VALYU_API_KEY is required to run the Valyu tool.")
        self.settings = settings
        self._tool = LangChainValyuSearchTool(valyu_api_key=settings.valyu_api_key)

    def run(self, query: str, **overrides: Any) -> Dict[str, Any]:
        payload = self._build_payload(query=query, overrides=overrides)
        try:
            raw_response = self._tool.invoke(payload)
        except Exception as exc:  # pragma: no cover - network dependency
            raise RuntimeError(f"Valyu search failed: {exc}") from exc
        return self._normalize_response(
            query=query,
            raw_response=raw_response,
            payload=payload,
        )

    def _build_payload(self, query: str, overrides: Mapping[str, Any]) -> Dict[str, Any]:
        params: Dict[str, Any] = {
            "query": query,
            "search_type": overrides.get("search_type", self.settings.valyu_search_type),
            "max_num_results": overrides.get(
                "max_num_results", self.settings.valyu_max_results
            ),
            "relevance_threshold": overrides.get(
                "relevance_threshold", self.settings.valyu_relevance_threshold
            ),
            "max_price": overrides.get("max_price", self.settings.valyu_max_price),
            "fast_mode": overrides.get("fast_mode", self.settings.valyu_fast_mode),
            "start_date": overrides.get("start_date", self.settings.valyu_start_date),
            "end_date": overrides.get("end_date", self.settings.valyu_end_date),
            "response_length": overrides.get(
                "response_length", self.settings.valyu_response_length
            ),
            "country_code": overrides.get(
                "country_code", self.settings.valyu_country_code
            ),
            "included_sources": overrides.get(
                "included_sources", _csv_to_list(self.settings.valyu_included_sources)
            ),
            "excluded_sources": overrides.get(
                "excluded_sources", _csv_to_list(self.settings.valyu_excluded_sources)
            ),
        }
        return {key: value for key, value in params.items() if value not in (None, "")}

    def _normalize_response(
        self,
        query: str,
        raw_response: Any,
        payload: Mapping[str, Any],
    ) -> Dict[str, Any]:
        parsed = self._ensure_serializable(self._maybe_parse_json(raw_response))
        if isinstance(parsed, dict):
            results = parsed.get("results") or parsed.get("data") or parsed
        else:
            results = parsed
        return {
            "query": query,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_params": dict(payload),
            "results": results,
            "raw": parsed,
        }

    @staticmethod
    def _maybe_parse_json(response: Any) -> Any:
        if isinstance(response, (dict, list)):
            return response
        if isinstance(response, str):
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return response
        return response

    @staticmethod
    def _ensure_serializable(value: Any) -> Any:
        if isinstance(value, (dict, list)):
            if isinstance(value, dict):
                return {
                    key: ValyuSearchTool._ensure_serializable(val)
                    for key, val in value.items()
                }
            return [ValyuSearchTool._ensure_serializable(item) for item in value]
        if isinstance(value, (str, int, float, bool)) or value is None:
            return value
        for attr in ("model_dump", "dict", "to_dict"):
            if hasattr(value, attr):
                try:
                    return ValyuSearchTool._ensure_serializable(getattr(value, attr)())
                except Exception:
                    continue
        if hasattr(value, "json"):
            try:
                return json.loads(value.json())
            except Exception:
                pass
        if hasattr(value, "__dict__"):
            return ValyuSearchTool._ensure_serializable(vars(value))
        return str(value)


__all__ = ["ValyuSearchTool"]
