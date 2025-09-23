import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/theme.css";

// Dev-only fetch interceptor to mock audit logs API when backend isn't running
if (import.meta.env.DEV) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const urlStr = typeof input === 'string' ? input : (input instanceof Request ? input.url : String(input));
      const url = new URL(urlStr, window.location.origin);
      const { pathname, searchParams } = url;

      const isAuditBase = /\/api\/v1\/accounts\/\d+\/api\/admin\/audit-logs/.test(pathname);
      if (!isAuditBase) {
        return originalFetch(input as any, init);
      }

      // Ping endpoint
      if (/\/api\/v1\/accounts\/\d+\/api\/admin\/audit-logs\/ping$/.test(pathname)) {
        return new Response(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate endpoint
      if (/\/api\/v1\/accounts\/\d+\/api\/admin\/audit-logs\/validate$/.test(pathname)) {
        return new Response(JSON.stringify({ valid: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Export endpoint
      if (/\/api\/v1\/accounts\/\d+\/api\/admin\/audit-logs\/export$/.test(pathname)) {
        const format = searchParams.get('format') || 'csv';
        const content =
          format === 'json'
            ? JSON.stringify({ payload: [], meta: { current_page: 1, next_page: null, prev_page: null, total_pages: 0, total_count: 0 } })
            : 'id,timestamp,action,actor,entity_type,success\n';
        return new Response(content, {
          status: 200,
          headers: { 'Content-Type': format === 'json' ? 'application/json' : 'text/csv' }
        });
      }

      // Detail endpoint
      const detailMatch = pathname.match(/\/api\/v1\/accounts\/(\d+)\/api\/admin\/audit-logs\/(\d+)$/);
      if (detailMatch) {
        const id = Number(detailMatch[2]);
        const mock = {
          id,
          request_id: `req_${id}`,
          timestamp: new Date().toISOString(),
          actor_id: 1,
          actor_role: 'super_admin',
          actor_ip: '127.0.0.1',
          entity_type: 'account',
          action: 'update',
          account_id: 1,
          cw_entity_id: 1,
          before: { name: 'Old' },
          after: { name: 'New' },
          success: true,
          error_message: null,
          hash: 'mock-hash',
          prev_hash: 'prev-mock-hash',
        };
        return new Response(JSON.stringify(mock), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // List endpoint
      if (/\/api\/v1\/accounts\/\d+\/api\/admin\/audit-logs$/.test(pathname)) {
        const page = Number(searchParams.get('page') || '1');
        const empty = {
          payload: [],
          meta: { current_page: page, next_page: null, prev_page: null, total_pages: 0, total_count: 0 }
        };
        return new Response(JSON.stringify(empty), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return originalFetch(input as any, init);
    } catch (err) {
      return originalFetch(input as any, init);
    }
  };
}

createRoot(document.getElementById("root")!).render(<App />);

