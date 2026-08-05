import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>© {new Date().getFullYear()} VivaVeríssimo · CRECI 00010E · Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};
