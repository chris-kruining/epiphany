import { Context, Flavor, Node } from '../types.js';
import { match } from 'ts-pattern';
import { uuid } from '~/utility.js';

export type FiberNode = {
    index: number,
    key: string,
    tag: Tag,
    type: any,
    stateNode: Element|undefined,
    child: FiberNode|null,
    sibling: FiberNode|null,
    memoizedProps: Record<string, any>,
    _debugID: number,
};

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

const fiberCache: WeakMap<FiberNode, Node> = new WeakMap;
const nodeMap: Map<string, Node> = new Map;

function getFiber(element: Element): FiberNode
{
    const fiberKey = Object.getOwnPropertyNames(element).find(n => n.startsWith('__reactFiber'))!;

    return (element as any)?.[fiberKey] as FiberNode;
}

function getChildren(node: FiberNode): FiberNode[]
{
    const children = [];
    let current = node.child;
    while(current !== null)
    {
        children.push(current);

        current = current.sibling;
    }

    return children;
}

async function fiberToNode(fiber: FiberNode, flavor: Flavor<FiberNode>, recurse: boolean = false, context?: Context): Promise<Node>
{
    if(fiberCache.has(fiber) === false)
    {
        const { index, key, tag, type } = fiber;
        const [ details, newContext ] = await flavor.getDetails(fiber, context);
        const id = uuid();

        const displayName: string = match(tag)
            .with(Tag.Element, () => type)
            .with(Tag.Class, () => type.constructor.name)
            .with(Tag.Function, () => type.name)
            .with(Tag.Text, () => fiber.memoizedProps)
            .with(Tag.ContextProvider, () => 'Context.Provider')
            .with(Tag.Forward, () => type.render.displayName)
            .otherwise(() => 'UNHANDLED_TYPE')

        const node = {
            ...details, // Details first so that they do not override any of the props beneath
            id,
            index,
            key,
            tag,
            displayName,
            children: recurse
                ? await Promise.all(getChildren(fiber).map(f => fiberToNode(f, flavor, recurse, newContext ?? context)))
                : [],
        };

        fiberCache.set(fiber, node);
        nodeMap.set(id, node);
    }

    return fiberCache.get(fiber)!;
}

export async function getNode(id: string, flavor: Flavor<FiberNode>): Promise<Node|undefined>
{
    return nodeMap.get(id);
}

export async function getNodeFromElement(element: Element, flavor: Flavor<FiberNode>, recurse: boolean = false): Promise<Node>
{
    return fiberToNode(getFiber(element), flavor, recurse);
}