export const MAX_URL_LENGTH = 2048;

export const MAX_HOSTNAME_LENGTH = 253;
export const MAX_LABEL_LENGTH = 63;

export const MAX_FETCH_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_DECOMPRESSED_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_COMPRESSION_RATIO = 100;

export const DNS_TIMEOUT_MS = 10_000;
export const CONNECTION_TIMEOUT_MS = 10_000;
export const TLS_HANDSHAKE_TIMEOUT_MS = 5_000;
export const HEADERS_TIMEOUT_MS = 10_000;
export const READ_TIMEOUT_MS = 10_000;
export const TOTAL_DEADLINE_MS = 30_000;

export const MAX_REDIRECTS = 3;

export const MAX_DNS_ANSWERS = 32;

export const MAX_HEADERS_SIZE = 8 * 1024;

export const USER_AGENT =
  "Mozilla/5.0 (compatible; NexoraSEOAnalyzer/1.0; +https://nexora.de/seo-analyzer)";

export const ACCEPT_HEADER = "text/html,application/xhtml+xml";

export const ALLOWED_SCHEMES = new Set(["http:", "https:"]);

export const ALLOWED_PORTS = new Set([80, 443]);

export const RESTRICTED_PORTS = new Set([
  21, 22, 23, 25, 53, 110, 135, 136, 137, 138, 139, 143, 389, 445, 873, 1433, 1521, 2049, 3306,
  3389, 5432, 6379, 8080, 8443,
]);

let _permissivePorts = false;
let _allowPrivateIps = false;

export function _enablePermissivePorts(): void {
  _permissivePorts = true;
}
export function _disablePermissivePorts(): void {
  _permissivePorts = false;
}
export function _enablePrivateIps(): void {
  _allowPrivateIps = true;
}
export function _disablePrivateIps(): void {
  _allowPrivateIps = false;
}

export function isPortAllowed(port: number): boolean {
  if (_permissivePorts) {
    return !RESTRICTED_PORTS.has(port);
  }
  return ALLOWED_PORTS.has(port);
}

export function isPrivateIpAllowed(): boolean {
  return _allowPrivateIps;
}

export const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^localhost\.$/i,
  /\.local$/i,
  /\.internal$/i,
  /\.home$/i,
  /\.localhost$/i,
];

export const METADATA_HOSTNAMES = new Set(["metadata.google.internal", "metadata.init.internal"]);

export const CLOUD_METADATA_IPS = ["169.254.169.254", "100.100.100.200"];

export const SINGLE_LABEL_DOMAINS = new Set(["localhost"]);
