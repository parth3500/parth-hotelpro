import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <div className="card shadow-sm border-danger mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-body p-4">
              <i className="bi bi-bug-fill text-danger fs-1 d-block mb-3"></i>
              <h3 className="card-title text-danger">Something went wrong</h3>
              <p className="card-text text-muted mb-4">
                {this.state.error?.message || 'An unexpected client error occurred.'}
              </p>
              <button onClick={this.handleReload} className="btn btn-primary">
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
