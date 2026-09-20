import type { Connect, Plugin, ViteDevServer } from "vite";

/**
 * CORP on same-origin responses (workers, wasm, scripts).
 *
 * COEP `require-corp` is deliberately NOT set: it blocks every third-party
 * iframe that does not opt in, which silently kills AdSense (the script loads
 * and requests ads, but the ad frames are blocked with ERR_BLOCKED_BY_RESPONSE).
 * Nothing here needs cross-origin isolation — the Ghostscript build is
 * single-threaded and uses no SharedArrayBuffer.
 */
export function crossOriginIsolationPlugin(): Plugin {
  return {
    name: "cross-origin-isolation",
    enforce: "pre",
    configureServer(server) {
      prependMiddleware(server, (req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
        next();
      });
    },
  };
}

function corpHeaders(res: { setHeader: (k: string, v: string) => void }) {
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
}

/** Run before Vite's transform middleware so large WASM/LO scripts are served raw. */
export function prependMiddleware(
  server: ViteDevServer,
  handler: Connect.NextHandleFunction
): void {
  (server.middlewares as Connect.Server).stack.unshift({ route: "", handle: handler });
}

export { corpHeaders };
