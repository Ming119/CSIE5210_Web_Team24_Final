import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CreateClubForm from "./CreateClubForm";
import MyClubsPagination from "./MyClubsPagination";

// 型別擴充：Club + members
type Member = {
  id: number;
  user: number;
  username?: string; // 新增 username 欄位
  club: number;
  status: string;
  is_manager: boolean;
  position?: string;
  name?: string;
  phone?: string;
  email?: string;
  joinDate?: string;
};

type Club = {
  id: number;
  name: string;
  presidentName?: string;
  memberCount?: { current: number; max: number };
  foundationDate?: string;
  status: string;
  members?: Member[];
};

const DataFormatter = {
  formatDate: (date: string | Date) => {
    if (typeof date === "string") return date;
    if (date instanceof Date) return date.toISOString().slice(0, 10);
    return "";
  },
  formatClubStatus: (status: string) => {
    switch (status) {
      case "active":
        return "營運中";
      case "pending":
        return "待審核";
      case "rejected":
        return "已拒絕";
      case "suspended":
        return "暫停營運";
      case "disbanded":
        return "已解散";
      default:
        return status;
    }
  },
};

const MyClubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const itemsPerPage = 5;
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const currentUserId = Number(localStorage.getItem("user_id"));

  const pendingClubs = isAdmin ? clubs.filter(club => club.status === "pending") : [];

  useEffect(() => {
    fetchMyClubs();
    // eslint-disable-next-line
  }, []);

  const fetchMyClubs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch("/api/myclubs/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("無法取得我的社團資料");
      const data = await res.json();
      setClubs(data);
    } catch (err: any) {
      setError(err.message || "載入失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  // 分頁
  const indexOfLastClub = currentPage * itemsPerPage;
  const indexOfFirstClub = indexOfLastClub - itemsPerPage;
  const currentClubs = clubs.slice(indexOfFirstClub, indexOfLastClub);
  const totalPages = Math.ceil(clubs.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleApprove = async (clubId: number) => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`/api/clubs/${clubId}/approve/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) throw new Error("審核失敗");
      fetchMyClubs();
    } catch (err) {
      alert("審核失敗");
    }
  };

  const handleReject = async (clubId: number) => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`/api/clubs/${clubId}/approve/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reject" }),
      });
      if (!res.ok) throw new Error("拒絕失敗");
      fetchMyClubs();
    } catch (err) {
      alert("拒絕失敗");
    }
  };

  if (loading) {
    return <div className="text-center">載入中...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>我的社團</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          建立社團
        </button>
      </div>

      {showCreateForm && (
        <CreateClubForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={fetchMyClubs}
        />
      )}

      {/* Approval Section for Admin */}
      {isAdmin && pendingClubs.length > 0 && (
        <div className="mb-5">
          <h4>待審核社團</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>社團名稱</th>
                  <th>現任社長</th>
                  <th>社團人數</th>
                  <th>創立日期</th>
                  <th>行動</th>
                </tr>
              </thead>
              <tbody>
                {pendingClubs.map((club) => (
                  <tr key={club.id}>
                    <td>{club.name}</td>
                    <td>{club.presidentName || "-"}</td>
                    <td>
                      {club.memberCount && club.memberCount.current !== undefined && club.memberCount.max !== undefined
                        ? `${club.memberCount.current}/${club.memberCount.max}`
                        : "-"}
                    </td>
                    <td>
                      {club.foundationDate
                        ? DataFormatter.formatDate(club.foundationDate)
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleApprove(club.id)}
                      >
                        通過
                      </button>
                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => handleReject(club.id)}
                      >
                        拒絕
                      </button>
                      <Link
                        to={`/clubs/${club.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        瀏覽
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Club List */}
      {clubs.length === 0 ? (
        <div className="alert alert-info">
          您目前未參與任何社團。點擊「建立社團」按鈕來創建新社團。
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>社團名稱</th>
                  <th>現任社長</th>
                  <th>社團人數</th>
                  <th>身份</th>
                  <th>社團狀態</th>
                  <th>創立日期</th>
                  <th>行動</th>
                </tr>
              </thead>
              <tbody>
                {currentClubs.map((club) => (
                  <tr key={club.id}>
                    <td>{club.name}</td>
                    <td>{club.presidentName || "-"}</td>
                    <td>
                      {club.memberCount && club.memberCount.current !== undefined && club.memberCount.max !== undefined
                        ? `${club.memberCount.current}/${club.memberCount.max}`
                        : "-"}
                    </td>
                    <td>
                      {(() => {
                        const myMembership = club.members?.find((m) => m.user === currentUserId);
                        if (!myMembership) return "-";
                        if (myMembership.status === "rejected") return "已拒絕";
                        return myMembership.position ||
                          myMembership.username ||
                          (myMembership.is_manager ? "社長" : "社員");
                      })()}
                    </td>
                    <td>
                      <span
                        className={`badge ${club.status === "active"
                          ? "bg-success"
                          : club.status === "pending"
                            ? "bg-warning text-dark"
                            : club.status === "rejected"
                              ? "bg-danger"
                              : club.status === "suspended"
                                ? "bg-secondary"
                                : club.status === "disbanded"
                                  ? "bg-dark"
                                  : "bg-light text-dark"
                          }`}
                      >
                        {DataFormatter.formatClubStatus(club.status)}
                      </span>
                    </td>
                    <td>
                      {club.foundationDate
                        ? DataFormatter.formatDate(club.foundationDate)
                        : "-"}
                    </td>
                    <td>
                      <Link
                        to={`/clubs/${club.id}`}
                        className="btn btn-primary btn-sm me-2"
                      >
                        瀏覽
                      </Link>
                      {isAdmin && club.status === "pending" && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleApprove(club.id)}
                          >
                            通過
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(club.id)}
                          >
                            拒絕
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <MyClubsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyClubs;