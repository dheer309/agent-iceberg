import React, {useState, useEffect} from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AgentNode from '../nodes/AgentNode';

import rawData from "../data/graphData.json";


// Main Flow Component - expects graphData.json to be imported
export default function FlowGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const nodeTypes = {
    agentNode: AgentNode
  };

  useEffect(() => {
    console.log('Raw data received:', rawData);
    
    if (!rawData?.content?.length) {
      console.error('No content found in rawData');
      return;
    }
    
    const contentObj = rawData.content[0];
    console.log('Content object:', contentObj);
    
    // The data is already parsed, nodes and edges are directly available
    const parsedContent = contentObj;
    
    if (!parsedContent.nodes || !parsedContent.edges) {
      console.error('No nodes or edges found in content');
      return;
    }
    
    console.log('Parsed content:', parsedContent);
    console.log('Nodes:', parsedContent.nodes);
    console.log('Edges:', parsedContent.edges);
    
    // Create edges for EVERY input and output, showing all connections
    const layoutEdges = [];
    
    parsedContent.edges.forEach((edge) => {
      layoutEdges.push({
        id: `e-${edge.source}-${edge.target}-${edge.label}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.label,
        targetHandle: edge.label,
        label: edge.label,
        animated: true,
        type: 'smoothstep',
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6',
        },
        labelStyle: { 
          fontSize: 11, 
          fill: '#1e40af',
          fontWeight: 600
        },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.9 }
      });
    });
    
    // Add edges for inputs that don't have explicit connections (like "query")
    parsedContent.nodes.forEach((node, nodeIdx) => {
      node.inputs?.forEach((input, inputIdx) => {
        // Check if this input already has a connection
        const hasConnection = parsedContent.edges.some(
          edge => edge.target === node.id && edge.label === input
        );
        
        if (!hasConnection) {
          // Create a placeholder "floating" edge for unconnected inputs
          layoutEdges.push({
            id: `e-floating-input-${node.id}-${input}`,
            source: node.id,
            target: node.id,
            sourceHandle: input,
            targetHandle: input,
            label: `${input} (unused)`,
            animated: false,
            type: 'straight',
            style: { 
              stroke: '#cbd5e1', 
              strokeWidth: 1,
              strokeDasharray: '3,3'
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#cbd5e1',
            },
            labelStyle: { 
              fontSize: 9, 
              fill: '#94a3b8',
              fontStyle: 'italic'
            },
            labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.8 },
            hidden: true  // Hide these placeholder edges
          });
        }
      });
      
      node.outputs?.forEach((output, outputIdx) => {
        // Check if this output already has a connection
        const hasConnection = parsedContent.edges.some(
          edge => edge.source === node.id && edge.label === output
        );
        
        if (!hasConnection) {
          // Create a placeholder "floating" edge for unconnected outputs
          layoutEdges.push({
            id: `e-floating-output-${node.id}-${output}`,
            source: node.id,
            target: node.id,
            sourceHandle: output,
            targetHandle: output,
            label: `${output} (unused)`,
            animated: false,
            type: 'straight',
            style: { 
              stroke: '#cbd5e1', 
              strokeWidth: 1,
              strokeDasharray: '3,3'
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#cbd5e1',
            },
            labelStyle: { 
              fontSize: 9, 
              fill: '#94a3b8',
              fontStyle: 'italic'
            },
            labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.8 },
            hidden: true  // Hide these placeholder edges
          });
        }
      });
    });
    
    console.log('Layout edges:', layoutEdges);
    
    // Simple hierarchical layout with increased spacing
    const layoutNodes = parsedContent.nodes.map((node, idx) => ({
      id: node.id,
      type: 'agentNode',
      data: {
        label: node.label,
        description: node.description || '',
        kind: node.kind,
        inputs: node.inputs || [],
        outputs: node.outputs || []
      },
      position: {
        x: idx * 500,  // Increased from 320 to 500
        y: 100
      }
    }));

    console.log('Layout nodes:', layoutNodes);
    console.log('Layout edges:', layoutEdges);
    console.log('Setting nodes and edges in state');

    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, []);

  console.log('Current nodes state:', nodes);
  console.log('Current edges state:', edges);

  return (
    <div style={{ height: '100vh', width: '100%', background: '#f8fafc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
      >
        <MiniMap
          nodeColor={(node) => {
            return node.data.kind === 'agent' ? '#3b82f6' : '#10b981';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Controls />
        <Background color="#cbd5e1" gap={16} />
      </ReactFlow>
    </div>
  );
}