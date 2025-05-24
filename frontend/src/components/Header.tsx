import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  // 在實際應用中，應該從認證系統或全域狀態管理取得登入狀態
  // 這裡先使用本地狀態模擬
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    // 模擬登入行為
    setIsLoggedIn(true);
    // 實際應用中這裡應該導向登入頁面或開啟登入對話框
  };

  const handleLogout = () => {
    // 模擬登出行為
    setIsLoggedIn(false);
    // 登出後導向首頁
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 py-2">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          NTU社團管理平台
        </Link>
        <div className="d-flex">
          {isLoggedIn ? (
            // 登入後顯示的內容
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
            // 登入前顯示的內容
            <button className="btn btn-primary ms-3" onClick={handleLogin}>
              登入/註冊
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
