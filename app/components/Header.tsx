import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo}>Viva Veríssimo</Link>
        <nav className={styles.nav}>
          <Link href="/">Início</Link>
          <Link href="/imoveis">Empreendimentos</Link>
          <Link href="/institucional">Institucional</Link>
          <Link href="/sobre">Sobre</Link>
          <a href="#contato">Contato</a>
        </nav>
      </div>
    </header>
  );
};
