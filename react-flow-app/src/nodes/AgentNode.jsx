import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node Component
export default function AgentNode({ data }) {
  const { label, description, kind, inputs = [], outputs = [] } = data;
  
  const isAgent = kind === 'agent';
  const isTool = kind === 'tool';
  
  return (
    <div className="agent-node" style={{
      padding: '12px 16px',
      borderRadius: 8,
      border: `2px solid ${isAgent ? '#3b82f6' : '#10b981'}`,
      background: 'white',
      minWidth: 220,
      maxWidth: 280,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Input Handles */}
      {inputs.map((inp, i) => (
        <Handle
          key={`in-${inp}`}
          type="target"
          id={inp}
          position={Position.Left}
          style={{
            top: 30 + i * 20,
            background: '#64748b',
            width: 10,
            height: 10
          }}
        />
      ))}
      
      {/* Node Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isAgent ? '#3b82f6' : '#10b981'
        }} />
        <strong style={{ fontSize: 14, color: '#1e293b' }}>
          {label}
        </strong>
      </div>
      
      {/* Kind Badge */}
      <div style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 8,
        background: isAgent ? '#dbeafe' : '#d1fae5',
        color: isAgent ? '#1e40af' : '#065f46'
      }}>
        {kind.toUpperCase()}
      </div>
      
      {/* Description */}
      <div style={{
        fontSize: 12,
        color: '#64748b',
        lineHeight: 1.4
      }}>
        {description}
      </div>
      
      {/* I/O Info */}
      <div style={{
        marginTop: 8,
        fontSize: 10,
        color: '#94a3b8',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>In: {inputs.length}</span>
        <span>Out: {outputs.length}</span>
      </div>
      
      {/* Output Handles */}
      {outputs.map((out, i) => (
        <Handle
          key={`out-${out}`}
          type="source"
          id={out}
          position={Position.Right}
          style={{
            top: 30 + i * 20,
            background: '#64748b',
            width: 10,
            height: 10
          }}
        />
      ))}
    </div>
  );
}