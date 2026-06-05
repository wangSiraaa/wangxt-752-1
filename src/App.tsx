import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Home from '@/pages/Home';
import Booking from '@/pages/Booking';
import Schedule from '@/pages/Schedule';
import Equipment from '@/pages/Equipment';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/equipment" element={<Equipment />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
