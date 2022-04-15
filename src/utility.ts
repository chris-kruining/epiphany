

export function uuid(): string
{
    // NOTE(Chris Kruining)
    // This is an exemption
    // for ts-ignore due to
    // performance optimizations,
    // do NOT use elsewhere
    // @ts-ignore
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}