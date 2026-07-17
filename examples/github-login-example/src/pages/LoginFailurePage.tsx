import { Link, useSearchParams } from "react-router";

const defaultMessage =
  "GitHub did not complete the authorization request. Start again to create a fresh login state.";

export function LoginFailurePage() {
  const [searchParams] = useSearchParams();
  const errorMessage =
    searchParams.get("message") ||
    searchParams.get("error_description") ||
    defaultMessage;

  return (
    <div className="page-content page-content--result">
      <div className="result-mark result-mark--failure" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <path d="m17 17 14 14M31 17 17 31" />
        </svg>
      </div>
      <div className="eyebrow eyebrow--failure">
        <span aria-hidden="true">●</span>
        Authentication stopped
      </div>
      <h1>GitHub sign-in didn’t finish.</h1>
      <p className="lede">{errorMessage}</p>

      <div className="error-receipt" role="alert">
        <span>Error detail</span>
        <code>{searchParams.get("error") || "oauth_callback_failed"}</code>
      </div>

      <div className="action-row">
        <Link className="primary-action primary-action--compact" to="/">
          Try GitHub again <span aria-hidden="true">→</span>
        </Link>
        <a
          className="secondary-action"
          href="https://github.com/settings/applications"
          rel="noreferrer"
          target="_blank"
        >
          Review GitHub access <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
