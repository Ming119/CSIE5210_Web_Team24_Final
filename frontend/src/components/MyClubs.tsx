import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { type Club } from "../models";
import { ClubService, DataFormatter } from "../api";
import MyClubsPagination from "./MyClubsPagination";
import CreateClubForm from "./CreateClubForm";

const MyClubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchMyClubs();
  }, []);

  const fetchMyClubs = async () => {
    try {
      setLoading(true);
      const data = await ClubService.getMyClubs();
      setClubs(data);
      setError(null);
    } catch (err) {
      console.error("獲取我的社團資料時發生錯誤:", err);
      setError("無法載入社團資料。請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  // 計算當前頁面需要顯示的社團
  const indexOfLastClub = currentPage * itemsPerPage;
  const indexOfFirstClub = indexOfLastClub - itemsPerPage;
  const currentClubs = clubs.slice(indexOfFirstClub, indexOfLastClub);

  // 計算總頁數
  const totalPages = Math.ceil(clubs.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
                      {club.memberCount
                        ? DataFormatter.formatMemberCount(club.memberCount)
                        : "-"}
                    </td>
                    <td>{club.userRole || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          club.status === "active"
                            ? "bg-success"
                            : club.status === "suspended"
                            ? "bg-warning"
                            : "bg-secondary"
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
