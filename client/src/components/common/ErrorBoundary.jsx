import { Component } from 'react'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
          <div className="w-full max-w-md glass-card p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 bg-rose-500/10">
              <FiAlertTriangle size={32} className="text-rose-500" />
            </div>
            
            <h1 className="font-display font-bold text-3xl text-white mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-slate-400 mb-6">
              We encountered an unexpected error. Our team has been notified.
            </p>

            {(import.meta.env.DEV || import.meta.env.MODE === 'development') && (
              <details className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/25 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-red-400 mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-slate-400 overflow-auto max-h-40">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <FiRefreshCw size={18} /> Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-secondary w-full py-3"
              >
                Go to Home
              </button>
            </div>

            {this.state.errorCount > 3 && (
              <p className="text-xs text-yellow-400 mt-4">
                ⚠️ Multiple errors detected. Try clearing your cache or contact support.
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
