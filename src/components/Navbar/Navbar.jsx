import "./Navbar.css";

const LINKS = ["HOME", "About us", "Dashboard", "Demo"];

export default function Navbar() {
  return (
    <nav className="navbar">
      <a className="navbar-brand" href="#home">
        <img src="/2d_huawei logo.png" alt="Huawei" className="navbar-logo" />
        {/* <span className="navbar-name">HUAWEI</span> */}
      </a>

      <ul className="navbar-links">
        {LINKS.map((label) => (
          <li key={label}>
            <a href={`#${label.toLowerCase().replace(/\s+/g, "")}`}>{label}</a>
          </li>
        ))}
      </ul>

      <img
        src="/TECH4CONNECT_2.png"
        alt="TECH 4 CONNECT"
        className="navbar-t4c-logo"
      />
    </nav>
  );
}
