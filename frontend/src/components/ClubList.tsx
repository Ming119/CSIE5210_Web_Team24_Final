import { useState } from "react";
import { dummyClubs, type Club } from "../models";
import ClubCard from "./ClubCard";
import Pagination from "./Pagination";

const ClubList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 計算當前頁面需要顯示的社團
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClubs = dummyClubs.slice(indexOfFirstItem, indexOfLastItem);

  // 計算總頁數
  const totalPages = Math.ceil(dummyClubs.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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
