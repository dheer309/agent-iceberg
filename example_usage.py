#
# FILE: example_usage.py
# (This file is already correct, just make sure you are importing
#  the new version of langchain_api.py)
#
from langchain_api import run_agent_and_split_output

# ============ GET QUERY FROM USER INPUT ============
print("=" * 60)
print("Multi-Agent Pipeline Query Runner")
print("=" * 60)
print()

query = input("Enter your query: ").strip()

if not query:
    print("Error: Query cannot be empty")
    exit(1)

print()

# ============ RUN AGENT AND CAPTURE STREAMING OUTPUT ============
# This function will now print "✓ Saved..." in real-time
saved_files = run_agent_and_split_output(
    query=query,
    output_dir='./query_results'
)

print()
print("=" * 60)
print("Results saved to:")
print("=" * 60)
for file in saved_files:
    print(f"  - {file}")
print()