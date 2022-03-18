export interface Bridge
{
    getTree(): Node,
    getElementFromPoint(x: number, y: number): Node|undefined,
}

export type Framework<N> = {
    getNodeFromElement(element: Element, flavor: Flavor<N>, recurse?: boolean): Node,
};

export type Flavor<N> = {
    getDetails(node: N): object,
};

export type Node = Record<string, any>|{
    id: number,
    index: number,
    key: string,
    tag: number,
    displayName: string,
    children: Node[],
};