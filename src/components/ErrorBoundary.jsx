import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keeps a useful stack in the devtools console.
    console.error("UI crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, fontFamily: "Arial, sans-serif" }}>
          <h2 style={{ margin: 0, color: "#7f1d1d" }}>Something went wrong</h2>
          <p style={{ marginTop: 8, color: "#7c2d12" }}>
            Open the browser console to see the error. Restarting the dev server
            also usually fixes blank screens after file changes.
          </p>
          <pre
            style={{
              marginTop: 12,
              padding: 12,
              background: "#fff7ed",
              border: "1px solid rgba(154,52,18,0.18)",
              borderRadius: 12,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              color: "#111827",
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

