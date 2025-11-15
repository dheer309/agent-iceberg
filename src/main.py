"""Entry point for running the multi-agent pipeline from the CLI."""
from __future__ import annotations

import argparse
import json
import sys

from .config import get_settings
from .pipeline import build_pipeline


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the holistic multi-agent pipeline.",
    )
    parser.add_argument("query", help="User query to solve")
    parser.add_argument(
        "--indent",
        type=int,
        default=None,
        help="Optional indentation level for the JSON payload",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    settings = get_settings()
    pipeline = build_pipeline(settings=settings)
    output = pipeline.run_as_json(args.query, indent=args.indent)
    print(output)
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
