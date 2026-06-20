import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-9xl font-bold gradient-text opacity-20 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-white mb-4 font-display">Page Not Found</h2>
      <p className="text-slate-400 max-w-md mb-8">The page you're looking for doesn't exist or has been moved to a new location.</p>
      <Link to="/" className="btn-primary px-10 py-4">Return Home</Link>
    </div>
  )
}

export default NotFound
