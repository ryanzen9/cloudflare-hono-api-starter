import { Link, Outlet, useLocation } from "react-router";

type FlowState = "ready" | "success" | "failure";

const getFlowState = (pathname: string): FlowState => {
  if (pathname === "/login/success") return "success";
  if (pathname === "/login/failure") return "failure";
  return "ready";
};

export function AuthLayout() {
  const { pathname } = useLocation();
  const flowState = getFlowState(pathname);

  return (
    <div className={`app-shell app-shell--${flowState}`}>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="GitHub OAuth example home">
          <span className="brand-mark" aria-hidden="true">
            CH
          </span>
          <span>
            <strong>Cloudflare Hono</strong>
            <small>OAuth example</small>
          </span>
        </Link>
        <span className="runtime-label">
          <span className="runtime-dot" aria-hidden="true" />
          Worker ready
        </span>
      </header>

      <main className="auth-stage">
        <aside className="flow-panel" aria-label="Authentication progress">
          <p className="panel-label">OAuth handshake</p>
          <ol className="flow-list">
            <li className={flowState === "ready" ? "is-current" : "is-done"}>
              <span>01</span>
              <div>
                <strong>Start</strong>
                <small>Choose GitHub</small>
              </div>
            </li>
            <li className={flowState === "ready" ? "" : "is-done"}>
              <span>02</span>
              <div>
                <strong>Authorize</strong>
                <small>Confirm identity</small>
              </div>
            </li>
            <li
              className={
                flowState === "success"
                  ? "is-current is-success"
                  : flowState === "failure"
                    ? "is-current is-failure"
                    : ""
              }
            >
              <span>03</span>
              <div>
                <strong>Return</strong>
                <small>
                  {flowState === "success"
                    ? "Session created"
                    : flowState === "failure"
                      ? "Action required"
                      : "Await callback"}
                </small>
              </div>
            </li>
          </ol>
          <div className="flow-note">
            <span aria-hidden="true">↳</span>
            GitHub verifies identity. This app issues its own JWT for API
            access.
          </div>
        </aside>

        <section className="page-panel">
          <Outlet />
        </section>
      </main>

      <footer className="site-footer">
        <span>React Router · Hono · Cloudflare Workers</span>
        <a
          href="https://github.com/ryanzen9/cloudflare-hono-api-starter"
          rel="noreferrer"
          target="_blank"
        >
          View source <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  );
}
