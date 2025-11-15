import os
import json
import traceback
from typing import List

# --- KEY CHANGE: Import your agent's builder directly ---
from src.pipeline import build_pipeline
from src.config import get_settings

# --- SET UP LANGSMITH (CRITICAL) ---
# Set these as environment variables before running
# This allows LangSmith to trace your agent's run
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = "YOUR_LANGSMITH_API_KEY"
# os.environ["OPENAI_API_KEY"] = "YOUR_LLM_API_KEY" (or Google, etc.)
# ------------------------------------


def run_agent_and_split_output(
    query: str,
    output_dir: str = './query_results',
) -> List[str]:
    """
    Run the agent by calling its pipeline.stream() method directly
    and save each yielded chunk to a separate file in real-time.
    """

    os.makedirs(output_dir, exist_ok=True)
    saved_files = []
    file_count = 0

    print(f"Starting agent execution...")
    print(f"Query: {query}")
    print("=" * 60)

    try:
        # 1. Build the pipeline, just like main.py does
        settings = get_settings()
        pipeline = build_pipeline(settings=settings)

        # 2. Call the NEW .stream() method
        print("... Agent is running. Listening for real-time steps ...\n")

        for chunk in pipeline.stream(query):

            # chunk will be a dict like {'pipeline_designer': {...}}
            if not chunk:
                continue

            file_count += 1

            # Get the node name (the key) for the filename
            node_name = list(chunk.keys())[0]
            node_output = chunk[node_name]

            file_path = os.path.join(output_dir, f'{file_count}_{node_name}.json')

            # --- CHANGE: Removed 'indent=2' to save raw JSON ---
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(node_output, f)
            # --------------------------------------------------

            saved_files.append(file_path)
            # THIS IS YOUR REAL-TIME OUTPUT
            print(f"✓ Saved in real-time: {file_path}")

    except Exception as e:
        print(f"Error during agent execution: {e}")
        traceback.print_exc()
        error_file = os.path.join(output_dir, 'error.json')
        with open(error_file, 'w', encoding='utf-8') as f:
            # We still indent the error file to make it readable
            json.dump({'error': str(e), 'query': query}, f, indent=2)
        return [error_file]

    # --- Save the final query info ---
    print("\n... Agent stream finished. Finalizing ...")
    print("=" * 60)
    print(f"Success! Processed {file_count} real-time file(s)")

    # We rename the final payload to be more descriptive
    if saved_files:
        last_file_path = saved_files[-1]
        if "final_payload" in last_file_path:
            final_file = os.path.join(output_dir, 'final_summary.json')
            try:
                os.rename(last_file_path, final_file)
                saved_files[-1] = final_file
                print(f"✓ Renamed: {final_file}")
            except OSError as e:
                print(f"Warning: Could not rename final payload: {e}")

    query_info_file = os.path.join(output_dir, 'query_info.json')
    with open(query_info_file, 'w', encoding='utf-8') as f:
        # We also indent the final summary file for readability
        json.dump({
            'query': query,
            'status': 'completed',
            'files_created': file_count,
        }, f, indent=2)
    saved_files.append(query_info_file)
    print(f"✓ Saved: {query_info_file}")

    return saved_files