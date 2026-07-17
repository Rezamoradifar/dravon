"use client";

/**
 * Only renders if the root layout itself throws - at that point the
 * LanguageProvider/theme/etc. may not be mounted, so this can't rely on any
 * app context and must render its own complete <html>/<body> with inline
 * styles, per Next.js's documented global-error contract.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0b0f1a",
          color: "#e5e7eb",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Something went wrong / مشکلی پیش آمد
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: "1rem" }}>
            The app hit an unexpected error while loading. / برنامه هنگام بارگذاری با خطای غیرمنتظره‌ای مواجه شد.
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#111827",
              padding: "0.75rem",
              borderRadius: 8,
              fontSize: "0.75rem",
              textAlign: "left",
              direction: "ltr",
            }}
          >
            {error.message || "Unknown error"}
            {error.digest ? `\ndigest: ${error.digest}` : ""}
          </pre>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.25rem",
              borderRadius: 8,
              background: "#6366f1",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Retry / تلاش دوباره
          </button>
        </div>
      </body>
    </html>
  );
}
