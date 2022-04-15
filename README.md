# Epiphany
introspection library for JS-frameworks, currently with sole support for Remix.

# Install

### The project to be inspected
`npm i -D @kruining/epiphany`

### The project that is inspecting
`npm i @kruining/epiphany`

# Usage

### The project to be inspected
`/app/root.tsx`
```diff
import {
    LiveReload,
    ScrollRestoration,
    Outlet,
    Meta,
    Scripts,
    LinksFunction,
} from 'remix';
+import { Epiphany } from '@kruining/epiphany';

export default function App()
{
    return <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <Meta />
            <Links />
        </head>
        <body>
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
+            <Epiphany />
        </body>
    </html>;
}
```

### The project that is inspecting

#### Theoretical

initialize needs a reference to a `Window` object which is running Epiphany. 
it communicates over `postMessage`, hence the need for the `Window`.

```ts
import { Bridge, initialize } from '@kruining/epiphany';

const frame: Window = iframe.contentWindow;
const bridge: Bridge = initialize(frame);
```

#### Practical

This is a example of how to could set up initialization for Epiphany. 
this is a stripped down version of my own setup for my CMS.

`/app/feature/cms/inspector.context.ts`
```tsx
import { Bridge, initialize } from '@kruining/epiphany';
import {
    createContext, Dispatch, Key,
    PropsWithChildren, SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

const bridgeContext = createContext<Bridge>(undefined);
const frameContext = createContext<any>(undefined);

export const useBridge = () => useContext(bridgeContext);
export const useSetContentWindow = () => useContext(frameContext);

let bridge: Bridge|undefined;
export function InspectorProvider({ children }: PropsWithChildren<{}>)
{
    const [ state, setState ] = useState<string>('');
    const [ frame, setFrame ] = useState<Window>();
    const [ highlights, setHighlights ] = useState<Highlight[]>([]);

    const providerValue = useMemo(() => bridge, [ state, setState ]);

    useEffect(() => {
        if(bridge === undefined && frame !== undefined)
        {
            bridge = initialize(frame!);

            setState('initialized');
        }
    }, [ frame ]);

    const setContentWindow = (window: Window) => {
        setFrame(window);
    };

    return <bridgeContext.Provider value={providerValue}>
        <frameContext.Provider value={setContentWindow}>
            {children}
        </frameContext.Provider>
    </bridgeContext.Provider>
}
```

### API

#### getTree

This methods gets the whole DOM tree with mapped source locations

```ts
const tree = await bridge.getTree();
```

#### getNode

Grab a node by its id. this id can be acquired via `getTree` or `getNodeFromPosition`.

```ts
const id: string = 'some-uuid';
const node = await bridge.getNode(id);
```

#### getNodeFromPosition

Query the element that lies on (x,y) in the inspected project

```ts
const event: MouseMoveEvent;
const node = await bridge.getNodeFromPosition(event.x, event.y);
```