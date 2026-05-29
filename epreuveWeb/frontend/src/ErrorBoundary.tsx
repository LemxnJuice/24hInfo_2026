import React from "react";

type State = { hasError: boolean; error?: string | null; info?: string | null };

export default class ErrorBoundary extends React.Component<
  { children?: React.ReactNode },
  State
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    const message = error?.message || String(error);
    const stack = error?.stack || (info && info.componentStack) || null;
    console.error("Uncaught error in React tree:", error, info);
    this.setState({ error: message, info: stack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", color: "#900", background: "#fff7f7" }}>
          <h2>Une erreur est survenue</h2>
          <p style={{ marginTop: 8 }}>
            Veuillez copier le message et la pile d'appels et les coller dans la
            discussion pour que je puisse corriger le problème :
          </p>
          <div
            style={{
              marginTop: 12,
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            <strong>Message:</strong>
            <div>{this.state.error}</div>
            <strong style={{ marginTop: 8 }}>Stack / component info:</strong>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#fff",
                padding: 8,
                borderRadius: 4,
              }}
            >
              {this.state.info}
            </pre>
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "8px 12px" }}
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children ?? null;
  }
}
