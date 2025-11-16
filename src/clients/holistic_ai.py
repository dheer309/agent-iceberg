"""LangChain chat model wrapper for Holistic AI's REST endpoint."""
from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

import requests
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.outputs import ChatGeneration, ChatResult

from ..config import Settings


class HolisticAIChatModel(BaseChatModel):
    """Simple wrapper that calls the Holistic AI invoke endpoint."""

    def __init__(
        self,
        settings: Settings,
        *,
        temperature: float = 0.2,
        timeout: int = 60,
    ) -> None:
        super().__init__()
        if not settings.holistic_api_token:
            raise RuntimeError("HOLISTIC_API_TOKEN is required.")
        if not settings.holistic_team_id:
            raise RuntimeError("HOLISTIC_TEAM_ID is required.")
        self._settings = settings
        self._temperature = temperature
        self._timeout = timeout

    @property
    def _llm_type(self) -> str:
        return "holistic-ai"

    def _call_endpoint(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        headers = {
            "Content-Type": "application/json",
            "X-Api-Token": self._settings.holistic_api_token,
        }
        response = requests.post(
            self._settings.holistic_api_endpoint,
            headers=headers,
            json=payload,
            timeout=self._timeout,
        )
        if not response.ok:
            raise RuntimeError(
                "Holistic AI request failed: "
                f"{response.status_code} {response.text.strip()}"
            )
        return response.json()

    def _convert_messages(self, messages: List[BaseMessage]) -> List[Dict[str, Any]]:
        converted: List[Dict[str, Any]] = []
        for message in messages:
            role = "user"
            content = message.content.rstrip()
            if isinstance(message, SystemMessage):
                content = f"[system]\n{content}"
            elif isinstance(message, HumanMessage):
                role = "user"
            else:
                role = "assistant"
            converted.append({"role": role, "content": content})
        return converted

    def _extract_text(self, response: Dict[str, Any]) -> str:
        if "output" in response and isinstance(response["output"], str):
            return response["output"]
        if "message" in response:
            message = response["message"]
            if isinstance(message, dict):
                content = message.get("content")
                if isinstance(content, str):
                    return content
                if isinstance(content, list):
                    return "\n".join(part.get("text", "") for part in content)
        if "choices" in response:
            choice = response["choices"][0]
            msg = choice.get("message", {})
            return msg.get("content", "")
        if "body" in response:
            body = response["body"]
            if isinstance(body, str):
                try:
                    parsed = json.loads(body)
                    return self._extract_text(parsed)
                except json.JSONDecodeError:
                    return body
            if isinstance(body, dict):
                return self._extract_text(body)
        return json.dumps(response)

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> ChatResult:
        payload: Dict[str, Any] = {
            "team_id": self._settings.holistic_team_id,
            "api_token": self._settings.holistic_api_token,
            "model": self._settings.holistic_model_id,
            "messages": self._convert_messages(messages),
            "max_tokens": kwargs.get("max_tokens", self._settings.max_logic_tokens),
            "temperature": kwargs.get("temperature", self._temperature),
        }
        if stop:
            payload["stop_sequences"] = stop
        response_json = self._call_endpoint(payload)
        text = self._extract_text(response_json)
        message = AIMessage(content=text)
        generation = ChatGeneration(message=message, generation_info={"raw": response_json})
        return ChatResult(generations=[generation])


__all__ = ["HolisticAIChatModel"]
