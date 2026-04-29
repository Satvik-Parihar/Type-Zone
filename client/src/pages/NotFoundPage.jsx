import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-container max-w-2xl py-16 mx-auto text-center">
      <h1 className="text-8xl font-bold text-text mb-4 font-mono">
        404
      </h1>
      <p className="text-2xl text-text-secondary mb-8">
        This page doesn't exist. Maybe you were looking for the typing test?
      </p>
      <Link
        to="/"
        className="px-8 py-4 btn-primary font-semibold rounded-xl inline-block"
      >
        Go Home
      </Link>
    </div>
  );
}
