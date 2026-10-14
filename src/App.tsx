import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from './store';
import { Navbar, Footer, AIAssistant } from './components';
import Home from './pages/Home';
import { Farms, Plans } from './pages/Browse';
import FarmDetail from './pages/FarmDetail';
import Checkout from './pages/Checkout';
import { Login, Signup, AdminLogin } from './pages/Auth';
import Tourist from './pages/Tourist';
import { Farmer, Guide } from './pages/Partners';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Provider>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<><Home /><AIAssistant role="home" /></>} />
          <Route path="/farms" element={<><Farms /><AIAssistant role="home" /></>} />
          <Route path="/farm/:id" element={<><FarmDetail /><AIAssistant role="tourist" /></>} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/plans" element={<><Plans /><AIAssistant role="tourist" /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/panel-verify-login" element={<AdminLogin />} />
          <Route path="/tourist" element={<><Tourist /><AIAssistant role="tourist" /></>} />
          <Route path="/farmer" element={<><Farmer /><AIAssistant role="farmer" /></>} />
          <Route path="/guide" element={<><Guide /><AIAssistant role="guide" /></>} />
          <Route path="/panel-verify" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </HashRouter>
    </Provider>
  );
}
