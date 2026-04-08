import Navbar from './Navbar';
import Footer from '../components/Footer';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">{children}</main>
      <Footer />
    </div>
  );
}
