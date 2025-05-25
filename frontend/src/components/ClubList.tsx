import { useEffect, useState } from "react";
import { type Club } from "../models";
import ClubCard from "./ClubCard";
import Pagination from "./Pagination";

const ClubList = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      fetch("/api/clubs/", { headers })
        .then(res => {
          if (res.status === 401) {
            // token 無效，移除 localStorage
            localStorage.removeItem("access");
            // 重新嘗試不帶 token
            return fetch("/api/clubs/", { headers: { "Content-Type": "application/json" } });
          }
          return res;
        })
        .then(res => res.json())
        .then(data => setClubs(data));
    } catch (err: any) {
      setError(err.message || "載入失敗");
    } finally {
      setLoading(false);
    }
  };
  fetchClubs();
}, []);

  // 只顯示 active 狀態的社團
  const activeClubs = clubs.filter((club) => club.status === "active");

  // 分頁
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClubs = activeClubs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activeClubs.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <div className="text-center">載入中...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="text-start">
      <h2 className="mb-4">社團一覽</h2>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {currentClubs.map((club: Club) => (
          <div className="col mb-4" key={club.id}>
            <ClubCard club={club} />
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-center mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ClubList;