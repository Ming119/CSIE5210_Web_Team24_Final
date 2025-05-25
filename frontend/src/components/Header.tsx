import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem("access"));
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setShowLogin(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;
    try {
      const res = await fetch("/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });
      if (!res.ok) throw new Error("登入失敗");
      const data = await res.json();
      console.log("login API response:", data); 
      localStorage.setItem("access", data.access);
      localStorage.setItem("user_id", String(data.user.id));
      localStorage.setItem("is_admin", String(data.user.is_admin));
      setIsLoggedIn(true);
      setShowLogin(false);
      setLoginUsername("");
      setLoginPassword("");
      // window.location.reload();
    } catch (err) {
      alert("登入失敗，請檢查帳號密碼");
    }
  };

  const handleRegister = async () => {
    setShowRegister(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerUsername || !registerEmail || !registerPassword) return;
    try {
      const res = await fetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
        }),
      });
      if (!res.ok) {
        let errorMsg = "Registration failed";
        try {
          const errorData = await res.json();
          if (errorData.detail) errorMsg = errorData.detail;
          else if (typeof errorData === "object")
            errorMsg = Object.values(errorData).flat().join("\n");
        } catch { }
        throw new Error(errorMsg);
      }
      setShowRegister(false);
      setRegisterUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
      alert("註冊成功，請登入");
    } catch (err: any) {
      alert("註冊失敗：" + (err.message || "請檢查資料"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("is_admin");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 py-2">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">
            NTU社團管理平台
          </Link>
          <div className="d-flex">
            {isLoggedIn ? (
              <>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <Link className="nav-link" to="/">
                      社團一覽
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/my-clubs">
                      我的社團
                    </Link>
                  </li>
                </ul>
                <button className="btn btn-primary ms-3" onClick={handleLogout}>
                  登出
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-primary ms-3" onClick={handleLogin}>
                  登入
                </button>
                <button className="btn btn-outline-secondary ms-2" onClick={handleRegister}>
                  註冊
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      {/* Login Modal */}
      {showLogin && (
        <div className="modal-backdrop" style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <form
            onSubmit={handleLoginSubmit}
            style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 300 }}
          >
            <h5 className="mb-3">登入</h5>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="帳號"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mb-2">
              <input
                type="password"
                className="form-control"
                placeholder="密碼"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-secondary me-2" onClick={() => setShowLogin(false)}>
                取消
              </button>
              <button type="submit" className="btn btn-primary">
                登入
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Register Modal */}
      {showRegister && (
        <div className="modal-backdrop" style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <form
            onSubmit={handleRegisterSubmit}
            style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 300 }}
          >
            <h5 className="mb-3">註冊</h5>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="帳號"
                value={registerUsername}
                onChange={e => setRegisterUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mb-2">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={registerEmail}
                onChange={e => setRegisterEmail(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <input
                type="password"
                className="form-control"
                placeholder="密碼"
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-secondary me-2" onClick={() => setShowRegister(false)}>
                取消
              </button>
              <button type="submit" className="btn btn-primary">
                註冊
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;