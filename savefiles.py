api_response_string = r"""{"content": [{"type": "text", "text": "{\n  \"query\": \"Where can I get the best cheese burger\",\n  \"pipeline_agent\": \"pipeline_architect_v1\",\n  \"rationale\": \"To find the best cheeseburger, we need to search for reviews and evidence, analyze the results, validate claims, and produce a well-reasoned recommendation.\",\n  \"nodes\": [\n    {\n      \"id\": \"valyu_search\",\n      \"label\": \"Valyu Search\",\n      \"kind\": \"tool\",\n      \"description\": \"Searches for cheeseburger reviews, ratings, and expert recommendations across proprietary and web sources\",\n      \"inputs\": [\"query\"],\n      \"outputs\": [\"search_packet\"]\n    },\n    {\n      \"id\": \"research_agent\",\n      \"label\": \"Research Agent\", \n      \"kind\": \"agent\",\n      \"description\": \"Organizes and synthesizes cheeseburger review data into structured findings\",\n      \"inputs\": [\"query\", \"search_packet\"],\n      \"outputs\": [\"research_summary\"]\n    },\n    {\n      \"id\": \"logic_agent\",\n      \"label\": \"Logic Agent\",\n      \"kind\": \"agent\", \n      \"description\": \"Analyzes findings to determine best cheeseburger options based on quality, value, and accessibility\",\n      \"inputs\": [\"query\", \"research_summary\"],\n      \"outputs\": [\"final_answer\"]\n    },\n    {\n      \"id\": \"validation_agent\",\n      \"label\": \"Validation Agent\",\n      \"kind\": \"agent\",\n      \"description\": \"Verifies restaurant claims and reviews for accuracy and recency\",\n      \"inputs\": [\"query\", \"final_answer\", \"research_summary\"],\n      \"outputs\": [\"validation_report\"]\n    }\n  ],\n  \"edges\": [\n    {\n      \"source\": \"valyu_search\",\n      \"target\": \"research_agent\",\n      \"label\": \"search_packet\",\n      \"metadata\": {}\n    },\n    {\n      \"source\": \"research_agent\", \n      \"target\": \"logic_agent\",\n      \"label\": \"research_summary\",\n      \"metadata\": {}\n    },\n    {\n      \"source\": \"logic_agent\",\n      \"target\": \"validation_agent\",\n      \"label\": \"final_answer\",\n      \"metadata\": {}\n    }\n  ],\n  \"recommended_sequence\": [\n    \"valyu_search\",\n    \"research_agent\",\n    \"logic_agent\",\n    \"validation_agent\"\n  ],\n  \"tools_used\": [\n    \"valyu_search\",\n    \"research_agent\",\n    \"logic_agent\",\n    \"validation_agent\"\n  ],\n  \"version\": \"1.0\"\n}"}], "usage": {"input_tokens": 1817, "output_tokens": 642, "total_tokens": 2459}, "metadata": {"team_id": "team_the_great_hack_2025_015", "model": "us.anthropic.claude-3-5-sonnet-20241022-v2:0", "cost_usd": 0.015081, "latency_ms": 9961.88, "remaining_quota": {"requests_today": 48, "tokens_today": 503442, "llm_cost": 1.73871, "gpu_cost": 0.0, "total_cost": 1.73871, "budget_limit": 50.0, "remaining_budget": 48.26129, "budget_usage_percent": 3.47742}}}"""
import json

# Step 1: Parse API response and keep as JSON string
def parse_api_response_to_json(api_response_string):
    """
    Parses API JSON response containing inner JSON and returns a JSON string
    with the inner JSON merged.
    """
    outer_data = json.loads(api_response_string)
    inner_json_str = outer_data["content"][0]["text"]
    inner_data = json.loads(inner_json_str)

    # Merge inner data into outer
    outer_data["content"][0] = {
        "type": outer_data["content"][0]["type"],
        **inner_data
    }

    # Return as JSON string
    return json.dumps(outer_data, indent=2)


# Step 2: Convert JSON string to React Flow dict
def convert_json_to_react_flow(json_string, x_gap=250, y_start=100):
    """
    Converts the parsed JSON string into React Flow compatible dict.
    """
    graph_data = json.loads(json_string)  # parse string to dict for processing

    content = graph_data.get("content", [])
    if not content:
        return {"nodes": [], "edges": []}

    content_obj = content[0]

    react_nodes = []
    for idx, node in enumerate(content_obj.get("nodes", [])):
        react_nodes.append({
            "id": node.get("id"),
            "type": "default",
            "data": {
                "label": node.get("label"),
                "description": node.get("description", ""),
                "kind": node.get("kind", ""),
                "inputs": node.get("inputs", []),
                "outputs": node.get("outputs", [])
            },
            "position": {"x": idx * x_gap, "y": y_start}
        })

    react_edges = []
    for edge in content_obj.get("edges", []):
        react_edges.append({
            "id": f"e-{edge.get('source')}-{edge.get('target')}",
            "source": edge.get("source"),
            "target": edge.get("target"),
            "label": edge.get("label", ""),
            "animated": True
        })

    return {"nodes": react_nodes, "edges": react_edges}


# -----------------------------
# Example usage
parsed_json_string = parse_api_response_to_json(api_response_string)
print(parsed_json_string)  # still JSON


print("\n\n\n PARSED FOR REACT FLOW: \n\n")
react_flow_data = convert_json_to_react_flow(parsed_json_string)
print(json.dumps(react_flow_data, indent=2))


parsed_json_string = parse_api_response_to_json(api_response_string)
with open("graphData.json", "w") as f:
    f.write(parsed_json_string)