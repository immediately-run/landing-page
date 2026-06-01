import ThemeSwitch from './ThemeSwitch';
import logoMark from '../assets/logo-mark.png';

function Nav() {
  return (
    <nav className="top">
      <a className="logo" href="#">
        <img className="logo-mark" src={logoMark} alt="" />
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
