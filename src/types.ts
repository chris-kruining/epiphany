export interface Bridge
{
    getTree(): Promise<Node>,
    getElementFromPoint(x: number, y: number): Promise<Node|undefined>,
}

export type Framework<N> = {
    getNodeFromElement(element: Element, flavor: Flavor<N>, recurse?: boolean): Promise<Node>,
};

export type Flavor<N> = {
    getDetails(node: N): Promise<object>,
};

export type Node = Record<string, any>|{
    id: number,
    index: number,
    key: string,
    tag: number,
    displayName: string,
    children: Node[],
};