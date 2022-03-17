import { Remote, windowEndpoint, wrap } from 'comlink';
import { Bridge } from './types.js';

export function useBridge(contentWindow: Window): Remote<Bridge>
{
    return wrap<Bridge>(windowEndpoint(contentWindow));
}