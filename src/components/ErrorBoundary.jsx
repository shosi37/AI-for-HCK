import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error in component tree:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-md shadow-md max-w-xl">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">{this.state.message}</div>
            <button onClick={() => location.reload()} className="btn-primary">Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
