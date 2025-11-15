import time
from uuid import uuid4

def create_node(action, node_type="llm_call", metadata=None):
    """Create a single node object."""
    return {
        "id": str(uuid4()),
        "action": action,
        "type": node_type,
        "timestamp": time.time(),
        "metadata": metadata or {}
    }