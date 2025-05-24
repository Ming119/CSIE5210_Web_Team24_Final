import { Link } from "react-router-dom";
import { type Club } from "../models";

interface ClubCardProps {
  club: Club;
}

const ClubCard = ({ club }: ClubCardProps) => {
  return (
    <Link to={`/clubs/${club.id}`} className="text-decoration-none text-dark">
      <div className="d-flex align-items-start">
        <div
          className="bg-success rounded flex-shrink-0 me-3"
          style={{ width: "80px", height: "80px" }}
        ></div>
        <div className="text-start">
          <h5 className="fw-bold mb-1">{club.name}</h5>
          <p className="mb-1">{club.description}</p>
          <p className="text-muted mb-0">點擊查看詳情</p>
        </div>
      </div>
    </Link>
  );
};

export default ClubCard;
