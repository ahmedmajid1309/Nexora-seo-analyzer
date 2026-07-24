import * as http from "http";
import * as https from "https";
import { readResponseStream, buildRequestOptions } from "./response-reader";
import { MAX_FETCH_SIZE_BYTES } from "./constants";
import { networkError } from "./types";
import type { SafeFetchOptions } from "./safe-fetch";

export async function fetchUrl(
  url: URL,
  address: string,
  options: SafeFetchOptions,
): Promise<{
  buffer: Buffer;
  statusCode: number;
  statusMessage: string;
  headers: http.IncomingHttpHeaders;
}> {
  const reqOptions = buildRequestOptions(url, address);
  const isHttps = url.protocol === "https:";
  const mod = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = mod.request(reqOptions, (res) => {
      readResponseStream(res, {
        maxSize: MAX_FETCH_SIZE_BYTES,
        signal: options.signal,
      })
        .then((result) => {
          resolve({
            buffer: result.buffer,
            statusCode: result.statusCode,
            statusMessage: result.statusMessage,
            headers: result.headers,
          });
        })
        .catch(reject);
    });

    req.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "EAI_AGAIN") {
        reject(networkError("CONNECTION_FAILED", `Could not connect to ${url.hostname}`));
      } else if (err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT") {
        reject(networkError("FETCH_TIMEOUT"));
      } else {
        reject(networkError("INTERNAL_ERROR", err.message));
      }
    });

    req.on("timeout", () => {
      req.destroy();
      reject(networkError("FETCH_TIMEOUT"));
    });

    if (options.signal?.aborted) {
      req.destroy();
      reject(networkError("REQUEST_ABORTED"));
      return;
    }

    options.signal?.addEventListener(
      "abort",
      () => {
        req.destroy();
        reject(networkError("REQUEST_ABORTED"));
      },
      { once: true },
    );

    req.end();
  });
}
