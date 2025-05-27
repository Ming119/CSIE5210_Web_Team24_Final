import { Link } from "react-router-dom";
import { type Club } from "../models";

interface ClubCardProps {
  club: Club;
}

const ClubCard = ({ club }: ClubCardProps) => {
  // 狀態標籤顏色與文字
  let statusLabel = "";
  let statusClass = "badge ms-2 ";
  switch (club.status) {
    case "active":
      statusLabel = "營運中";
      statusClass += "bg-success";
      break;
    case "pending":
      statusLabel = "待審核";
      statusClass += "bg-warning text-dark";
      break;
    case "rejected":
      statusLabel = "已拒絕";
      statusClass += "bg-danger";
      break;
    case "suspended":
      statusLabel = "暫停營運";
      statusClass += "bg-secondary";
      break;
    case "disbanded":
      statusLabel = "已解散";
      statusClass += "bg-dark";
      break;
    default:
      statusLabel = "";
      statusClass += "bg-light text-dark";
  }

  return (
    <Link to={`/clubs/${club.id}`} className="text-decoration-none text-dark">
      <div className="d-flex align-items-start">
        <div
          className="bg-success rounded flex-shrink-0 me-2"
          style={{ width: "100px", height: "100px" }}
        ></div>
        <div className="text-start">
          <h5 className="fw-bold mb-1">
            {club.name}
          </h5>
          <p
            className="mb-0"
            style={{
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              whiteSpace: "normal",
              wordBreak: "break-all",
            }}
            title={club.description}
          >
            {club.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ClubCard;