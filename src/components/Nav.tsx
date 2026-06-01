import ThemeSwitch from './ThemeSwitch';

function Nav() {
  return (
    <nav className="top">
      <a className="logo" href="#">
        <span className="sq" />
        immediately.run
      </a>
      <div className="links">
        <a href="#showcase">Showcase</a>
        <a href="#docs">Docs</a>
        <a href="#news">News</a>
        <a href="#">Community</a>
      </div>
      <div className="cta">
        <ThemeSwitch />
        <span className="star">★ 8,412</span>
        <a className="btn" href="#docs">
          Start building →
        </a>
      </div>
    </nav>
  );
}

export default Nav;
