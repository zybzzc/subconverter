import type { ProxyNode, GenerateOptions } from '../types';
import { NodeProcessor, ProcessedNodes } from './processor';
import {
  isInfoNode,
  isResidentialNode,
  groupNodesByCountry,
  deduplicateNodes
} from './generator';

/**
 * Default processor using Regular Expressions and keyword matching.
 */
export class RegexNodeProcessor implements NodeProcessor {
  async process(nodes: ProxyNode[], options: GenerateOptions): Promise<ProcessedNodes> {
    const {
      groupByCountry = true,
      detectResidential = true,
    } = options;

    // 1. Deduplicate
    const uniqueNodes = deduplicateNodes(nodes);

    // 2. Filter info nodes
    const realNodes = uniqueNodes.filter(n => !isInfoNode(n.name));

    // 3. Residential classification
    const residentialNodes = detectResidential
      ? realNodes.filter(n => (n as any)._forceResidential === true || isResidentialNode(n.name, options.customResidentialKeywords))
      : [];

    const normalNodes = realNodes.filter(n => !((n as any)._forceResidential === true || isResidentialNode(n.name, options.customResidentialKeywords)));

    // 4. Country grouping
    const nodesByCountry = groupByCountry ? groupNodesByCountry(normalNodes) : {};

    return {
      realNodes,
      residentialNodes,
      normalNodes,
      nodesByCountry,
    };
  }
}
