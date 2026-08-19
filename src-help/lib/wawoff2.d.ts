// wawoff2 ships no type declarations; minimal surface we use.
declare module 'wawoff2' {
  export function decompress(data: Uint8Array): Promise<Uint8Array>;
  export function compress(data: Uint8Array): Promise<Uint8Array>;
}
