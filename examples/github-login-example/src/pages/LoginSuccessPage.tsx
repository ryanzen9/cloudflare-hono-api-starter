import { Link, useSearchParams } from "react-router";

export function LoginSuccessPage() {
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username") || "GitHub user";
  const userId = searchParams.get("userId");

  return (
    <div className="page-content page-content--result">
      <div className="result-mark result-mark--success" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <path d="m14 25 6.5 6.5L35 17" />
        </svg>
      </div>
      <div className="eyebrow eyebrow--success">
        <span aria-hidden="true">●</span>
        Authentication complete
      </div>
      <h1>You’re signed in.</h1>
      <p className="lede">
        Welcome, <strong>{username}</strong>. GitHub authorization completed and
        the Worker created your local session.
      </p>

      <dl className="result-receipt">
        <div>
          <dt>Status</dt>
          <dd>
            <span className="status-pill status-pill--success">Verified</span>
          </dd>
        </div>
        <div>
          <dt>Provider</dt>
          <dd>GitHub</dd>
        </div>
        <div>
          <dt>Local user</dt>
          <dd>{userId ? `#${userId}` : "Created"}</dd>
        </div>
      </dl>

      <div className="action-row">
        <Link className="primary-action primary-action--compact" to="/">
          Return to example <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
