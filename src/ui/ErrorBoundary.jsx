import { Component } from 'react'

// If the WebGPU/WebGL context can't be created, we still want a beautiful room:
// fall back to a lit gradient that matches the booth's mood, and let the UI show.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(err) {
    console.error('[EchoRoom] scene failed, showing fallback:', err)
    this.props.onError?.()
  }

  render() {
    if (this.state.failed) {
      return <div className="stage-fallback" aria-hidden="true" />
    }
    return this.props.children
  }
}
