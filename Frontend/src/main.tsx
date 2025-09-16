import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './pages/Home';
import './styles/tailwind.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Home />);
}
