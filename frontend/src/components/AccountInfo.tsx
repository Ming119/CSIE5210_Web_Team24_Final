import { useEffect, useState } from "react";

const AccountInfo = () => {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 密碼變更
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [pwSuccess, setPwSuccess] = useState<string | null>(null);
    const [pwError, setPwError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInfo = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("access");
                const res = await fetch("/api/me/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) throw new Error("無法取得帳戶資料");
                const data = await res.json();
                setUsername(data.username || "");
                setName(data.name || "");
                setContact(data.contact || "");
                setEmail(data.email || "");
            } catch (err: any) {
                setError("無法取得帳戶資料");
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, []);

    // 更新基本資料
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);
        setError(null);
        try {
            const token = localStorage.getItem("access");
            const res = await fetch("/api/me/", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, contact }),
            });
            if (!res.ok) throw new Error("更新失敗");
            setSuccess("資料已更新");
        } catch (err) {
            setError("更新失敗，請稍後再試。");
        }
    };

    // 修改密碼
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwSuccess(null);
        setPwError(null);
        try {
            const token = localStorage.getItem("access");
            const res = await fetch("/api/me/", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "密碼變更失敗");
            }
            setPwSuccess("密碼已變更");
            setOldPassword("");
            setNewPassword("");
        } catch (err: any) {
            setPwError(err.message || "密碼變更失敗");
        }
    };

    if (loading) return <div className="text-center">載入中...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container py-4" style={{ maxWidth: 500 }}>
            <h2 className="mb-4 text-center">帳戶資訊</h2>
            <form onSubmit={handleSave}>
                <div className="mb-3 text-start">
                    <label className="form-label fw-bold">帳號</label>
                    <input className="form-control" value={username} disabled />
                </div>
                <div className="mb-3 text-start">
                    <label className="form-label fw-bold">姓名</label>
                    <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="mb-3 text-start">
                    <label className="form-label fw-bold">聯絡方式</label>
                    <input className="form-control" value={contact} onChange={e => setContact(e.target.value)} />
                </div>
                <div className="mb-3 text-start">
                    <label className="form-label fw-bold">Email</label>
                    <input className="form-control" value={email} disabled />
                </div>
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary">儲存</button>
            </form>
            <hr />
            <h5 className="mt-4 text-center">變更密碼</h5>
            <form onSubmit={handleChangePassword}>
                <div className="mb-2 text-start">
                    <label className="form-label fw-bold">舊密碼</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="舊密碼"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                    />
                </div>
                <div className="mb-2 text-start">
                    <label className="form-label fw-bold">新密碼</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="新密碼"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />
                </div>
                {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}
                {pwError && <div className="alert alert-danger">{pwError}</div>}
                <button type="submit" className="btn btn-outline-primary">變更密碼</button>
            </form>
        </div>
    );
};

export default AccountInfo;