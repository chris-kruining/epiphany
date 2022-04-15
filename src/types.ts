import { SyntaxKind } from 'typescript';

export interface Bridge
{
    getTree(): Promise<Node>,
    getNode(id: string): Promise<Node|undefined>,
    getNodeFromPoint(x: number, y: number): Promise<Node|undefined>,
}

export type Framework<N> = {
    getNode(id: string, flavor: Flavor<N>): Promise<Node|undefined>,
    getNodeFromElement(element: Element, flavor: Flavor<N>, recurse?: boolean): Promise<Node>,
};

export type Flavor<N> = {
    getDetails(node: N, context?: Context): Promise<[ object, Context|undefined ]>,
};

export interface Context
{
    ast?: SimplifiedAstNode;
}

export type Node = Record<string, any>|{
    id: number,
    index: number,
    key: string,
    tag: number,
    displayName: string,
    children: Node[],
};

export type SimplifiedAstNode = {
    start: { line: number, character: number, index: number },
    end: { line: number, character: number, index: number },
    kind: SyntaxKind,
    type: string,
    original: any,
    parent?: SimplifiedAstNode,
    children: SimplifiedAstNode[],
};

export type TransferableNode = Omit<SimplifiedAstNode, 'original'|'parent'|'children'>;