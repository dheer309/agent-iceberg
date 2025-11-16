import { readFileSync } from "fs";
import { cleanPayload } from "./lib/middleware/cleanPayload";

// Read and parse the payload file
const payloadContent = readFileSync("./lib/payloads/payload-2.txt", "utf-8");
const payload = JSON.parse(payloadContent);

console.log("Original payload structure:");
console.log(
  "Results count:",
  payload.completed_nodes?.valyu_search?.results?.length || 0
);
console.log(
  "First result type:",
  typeof payload.completed_nodes?.valyu_search?.results?.[0]
);
console.log(
  "First result URL:",
  payload.completed_nodes?.valyu_search?.results?.[0]?.url
);

// Clean the payload
const cleaned = cleanPayload(payload);

console.log("\n--- After cleaning ---");
console.log(
  "Results count:",
  cleaned.completed_nodes?.valyu_search?.results?.length || 0
);
console.log(
  "Results type:",
  Array.isArray(cleaned.completed_nodes?.valyu_search?.results)
    ? typeof cleaned.completed_nodes?.valyu_search?.results[0]
    : "not an array"
);
console.log("First 3 URLs:");
cleaned.completed_nodes?.valyu_search?.results
  ?.slice(0, 3)
  .forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`);
  });

// Verify all results are strings
const allAreStrings = cleaned.completed_nodes?.valyu_search?.results?.every(
  (item) => typeof item === "string"
);
console.log("\nAll results are strings:", allAreStrings);

// Verify pipeline_graph.nodes is preserved
console.log("\n--- Pipeline Graph Nodes Verification ---");
const originalNodes = Array.isArray(payload.pipeline_graph?.nodes)
  ? payload.pipeline_graph.nodes
  : [];
const cleanedNodes = Array.isArray(cleaned.pipeline_graph?.nodes)
  ? cleaned.pipeline_graph.nodes
  : [];

const originalNodesCount = originalNodes.length;
const cleanedNodesCount = cleanedNodes.length;

console.log("Original nodes count:", originalNodesCount);
console.log("Cleaned nodes count:", cleanedNodesCount);
console.log("Nodes count matches:", originalNodesCount === cleanedNodesCount);

if (cleanedNodes.length > 0) {
  const firstNode = cleanedNodes[0] as Record<string, unknown>;
  console.log("\nFirst node structure:");
  console.log("  - id:", firstNode.id);
  console.log("  - label:", firstNode.label);
  console.log("  - kind:", firstNode.kind);
  console.log("  - description:", firstNode.description);
  console.log("  - inputs:", firstNode.inputs);
  console.log("  - outputs:", firstNode.outputs);

  // Verify node structure is preserved
  const nodeHasRequiredFields =
    "id" in firstNode && "label" in firstNode && "kind" in firstNode;
  console.log("\nNode structure preserved:", nodeHasRequiredFields);

  // Verify all nodes are preserved
  const allNodesPreserved = cleanedNodes.every(
    (node) => node && typeof node === "object" && "id" in node
  );
  console.log("All nodes are objects with id:", allNodesPreserved);
}
