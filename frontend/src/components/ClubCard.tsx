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
        {club.image ? (
          <img
            src={`${import.meta.env.VITE_API_URL || ""}${club.image}`}
            alt="社團圖片"
            className="rounded mb-2 me-3"
            style={{ width: "100px", height: "100px", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div
            className="bg-secondary rounded mb-2 me-3 d-flex align-items-center justify-content-center"
            style={{ width: "100px", height: "100px", flexShrink: 0 }}
          >
            <span className="text-white">無社團圖片</span>
          </div>
        )}
        <div className="text-start flex-grow-1">
          <h5 className="fw-bold mb-1 d-flex align-items-center">
            {club.name}
            {/* {statusLabel && <span className={statusClass}>{statusLabel}</span>} */}
          </h5>
          <p
            className="mb-0"
            style={{
              maxWidth: "300px",
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