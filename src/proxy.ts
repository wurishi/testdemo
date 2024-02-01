export const host = '124.221.113.125:8080';

export const port = 22226

export const base = `/proxy/${port}`;
// export const base = '';

export const hmr = base ? {
    host: host + base
} : undefined;

export function getAssetsUrl(url: string): string {
    return base + url;
}