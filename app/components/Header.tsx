import Link from 'next/link';
import styles from './page.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo}>Viva Veríssimo</Link>
        <nav className={styles.nav}>
          <Link href="/">Início</Link>
          <Link href="/imoveis">Empreendimentos</Link>
          <a href="#contato">Contato</a>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p>© {new Date().getFullYear()} VivaVeríssimo · CRECI 00010E · Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
