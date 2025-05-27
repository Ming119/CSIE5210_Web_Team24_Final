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
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // for controlled input

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
              localStorage.removeItem("access");
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

  // 搜尋過濾
  const filteredClubs = activeClubs.filter(
    (club) =>
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      (club.description && club.description.toLowerCase().includes(search.toLowerCase()))
  );

  // 分頁
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClubs = filteredClubs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClubs.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // 當搜尋時自動跳回第一頁
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
  };

  if (loading) return <div className="text-center">載入中...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="text-start">
      <h2 className="mb-4">社團一覽</h2>
      <form className="mb-3 d-flex gap-2 flex-row align-items-center" onSubmit={handleSearch}>
        <input
          type="text"
          className="form-control"
          placeholder="搜尋社團名稱或描述"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary d-inline-flex align-items-center px-3"
          style={{ whiteSpace: "nowrap" }}
        >
          <span className="me-1" aria-hidden="true">🔍</span>
          <span>搜尋</span>
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary d-inline-flex align-items-center px-3"
          style={{ whiteSpace: "nowrap" }}
          onClick={handleReset}
        >
          <span className="me-1" aria-hidden="true">⟲</span>
          <span>重設</span>
        </button>
      </form>
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