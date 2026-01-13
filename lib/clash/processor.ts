import type { ProxyNode, GenerateOptions } from '../types';

/**
 * Result of node processing
 */
export interface ProcessedNodes {
  realNodes: ProxyNode[];
  residentialNodes: ProxyNode[];
  normalNodes: ProxyNode[];
  nodesByCountry: Record<string, ProxyNode[]>;
}

/**
 * Interface for node information processing (Adapter/Strategy Pattern)
 * This allows swapping between Regex-based and AI-based logic.
 */
export interface NodeProcessor {
  process(nodes: ProxyNode[], options: GenerateOptions): Promise<ProcessedNodes>;
}
