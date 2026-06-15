import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Route-level error boundary for the content region (brief 01, "section-failed"
// state). If a section throws while rendering, the shell stays put and we draw a
// friendly inline card instead of a blank frame. In App.tsx this is keyed by the
// active section, so navigating to another section remounts it and clears the
// error — and the in-card links do exactly that.
class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface it for debugging; the user still gets the recovery card.
    console.error('Section failed to render:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="section-error" role="alert">
        <h2 className="section-error__title">This section didn't load.</h2>
        <p className="section-error__body">Reload it, or head to the showcase.</p>
        <div className="section-error__actions">
          <button
            type="button"
            className="section-error__btn section-error__btn--primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
          <a className="section-error__btn" href="#/showcase">
            Go to showcase
          </a>
          <a className="section-error__btn" href="#/">
            Back home
          </a>
        </div>
      </div>
    );
  }
}

export default SectionErrorBoundary;
