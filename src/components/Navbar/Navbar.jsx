import "./Navbar.css";

const LINKS = [
  { label: "HOME", target: "home" },
  { label: "About us", target: "aboutus" },
  { label: "Dashboard", target: "dashboard" },
  { label: "Demo", target: "demo" },
];

export default function Navbar() {
  const handleClick = (e, target) => {
    e.preventDefault();
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="navbar">
      <a
        className="navbar-brand"
        href="#home"
        onClick={(e) => handleClick(e, "home")}
      >
        <img src="/2d_huawei logo.png" alt="Huawei" className="navbar-logo" />
        {/* <span className="navbar-name">HUAWEI</span> */}
      </a>

      <ul className="navbar-links">
        {LINKS.map(({ label, target }) => (
          <li key={label}>
            <a href={`#${target}`} onClick={(e) => handleClick(e, target)}>
              {label}
            </a>
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
