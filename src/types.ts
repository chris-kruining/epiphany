export interface Bridge
{
    getReactFiberTree(): Node,
    getElementFromPoint(x: number, y: number): Node|undefined,
}

export interface Node
{

}

export enum Tag
{
    Function = 0,
    Class = 1,
    Intermediate = 2,
    Root = 3,
    Portal = 4,
    Element = 5,
    Text = 6,
    Fragment = 7,
    Mode = 8,
    ContextConsumer = 9,
    ContextProvider = 10,
    Forward = 11,
    Profiler = 12,
    Suspense = 13,
}