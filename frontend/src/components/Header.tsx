import { useEffect, useState } from "react";
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
  const [username, setUsername] = useState<string | null>(null); // 新增 username 狀態
  const navigate = useNavigate();

  // 取得 username，並在 session 無效時自動 reset header 狀態
  useEffect(() => {
    if (isLoggedIn) {
      const stored = localStorage.getItem("username");
      if (stored) {
        setUsername(stored);
      } else {
        fetch("/api/me/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "application/json",
          },
        })
          .then(res => {
            if (res.status === 401 || res.status === 403) {
              // session 無效，重設 header 狀態
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              localStorage.removeItem("is_admin");
              localStorage.removeItem("username");
              setIsLoggedIn(false);
              setUsername(null);
              return null;
            }
            return res.ok ? res.json() : null;
          })
          .then(data => {
            if (data && data.username) {
              setUsername(data.username);
              localStorage.setItem("username", data.username);
            }
          });
      }
    } else {
      setUsername(null);
      localStorage.removeItem("username");
    }
  }, [isLoggedIn]);

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
      localStorage.setItem("access", data.access);
      localStorage.setItem("user_id", String(data.user.id));
      localStorage.setItem("is_admin", String(data.user.is_admin));
      localStorage.setItem("username", data.user.username); // 存 username
      setUsername(data.user.username); // 設定 username 狀態
      setIsLoggedIn(true);
      setShowLogin(false);
      setLoginUsername("");
      setLoginPassword("");
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
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername(null);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 py-2">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* 左側：logo + 帳號 */}
          <div className="d-flex align-items-center">
            <Link className="navbar-brand fw-bold mb-0 h1" to="/">
              NTU社團管理平台
            </Link>
          </div>
          {/* 右側：導覽列 */}
          <div className="d-flex align-items-center">
            <Link className="nav-link px-2" to="/">
              社團一覽
            </Link>
            {isLoggedIn && (
              <Link className="nav-link px-2" to="/my-clubs">
                我的社團
              </Link>
            )}
            {isLoggedIn && username && (
              <Link
                to="/account"
                className="d-flex align-items-center px-2"
                style={{
                  fontSize: "1rem",
                  textDecoration: "none",
                  color: "#0d6efd",
                  fontWeight: 500,
                }}
              >
                <i className="bi bi-person-circle me-1" style={{ fontSize: "1.4rem" }}></i>
                <span className="ms-1">{username}</span>
              </Link>
            )}
            {isLoggedIn ? (
              <button className="btn btn-primary ms-3" onClick={handleLogout}>
                登出
              </button>
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