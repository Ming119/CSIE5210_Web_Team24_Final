import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// 型別定義
type Member = {
  id: number;
  user: number;
  username: string;
  club: number;
  status: string;
  is_manager: boolean;
  position?: string;
  phone?: string;
  email?: string;
  joinDate?: string;
};

type Activity = {
  id: number;
  name: string;
  period: string;
  fee: number;
  status: string;
};

type ClubDetailData = {
  id: number;
  name: string;
  description: string;
  foundationDate: string;
  memberCount: { current: number; max: number };
  status: string;
  members: Member[];
  activities: Activity[];
  presidentName?: string;
};

// 職位常數
const CLUB_POSITIONS = [
  "社長",
  "副社長",
  "活動幹部",
  "財務幹部",
  "公關幹部",
  "社員",
];

const formatClubStatus = (status: string) => {
  switch (status) {
    case "active":
      return "啟用";
    case "pending":
      return "待審核";
    case "rejected":
      return "已拒絕";
    case "suspended":
      return "停權";
    case "disbanded":
      return "已解散";
    default:
      return status;
  }
};

const ClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clubDetail, setClubDetail] = useState<ClubDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingClubInfo, setIsEditingClubInfo] = useState<boolean>(false);
  const [editedClubInfo, setEditedClubInfo] = useState({
    name: "",
    description: "",
    maxMembers: 0,
  });
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingMemberPosition, setEditingMemberPosition] = useState<string>("");

  // 取得當前登入 user id
  const currentUserId = Number(localStorage.getItem("user_id"));

  useEffect(() => {
    const fetchClubDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("access");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(`/api/clubs/${id}/`, {
          headers,
        });
        if (!res.ok) throw new Error("無法取得社團資料");
        const data = await res.json();
        setClubDetail({
          ...data,
          foundationDate: data.foundation_date,
        });
        setEditedClubInfo({
          name: data.name,
          description: data.description,
          maxMembers: data.memberCount?.max ?? 0,
        });
        setError(null);
      } catch (err) {
        setError("無法載入社團詳情。請稍後再試。");
      } finally {
        setLoading(false);
      }
    };
    fetchClubDetail();
  }, [id]);

  if (loading) return <div className="text-center">載入中...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!clubDetail) return <div className="alert alert-warning">找不到社團資訊</div>;

  const currentMemberCount = clubDetail.members.filter(
    (member) => member.status === "accepted"
  ).length;

  // 取得自己在這個社團的 membership
  const myMembership = clubDetail.members.find(m => m.user === currentUserId);
  const myRole = myMembership
    ? myMembership.position || (myMembership.is_manager ? "社長" : "社員")
    : "非社員";

  console.log("myMembership", myMembership);
  console.log("currentUserId", currentUserId);
  console.log("clubDetail.members", clubDetail.members);
  // 儲存社團資訊
  const handleSaveClubInfo = async () => {
  if (!clubDetail) return;
  try {
    const token = localStorage.getItem("access");
    const res = await fetch(`/api/clubs/${clubDetail.id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editedClubInfo.name,
        description: editedClubInfo.description,
        max_member: editedClubInfo.maxMembers,
      }),
    });
    if (!res.ok) throw new Error("儲存失敗");
    const data = await res.json();
    setClubDetail({
      ...data,
      foundationDate: data.foundation_date,
    });
    setIsEditingClubInfo(false);
  } catch (err) {
    alert("儲存失敗，請稍後再試。");
  }
};

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-start m-0">社團資訊</h2>
        <div>
          <Link to="/" className="btn btn-outline-secondary me-2">
            返回社團列表
          </Link>
          {myMembership && myMembership.is_manager && myMembership.position === "社長" && !isEditingClubInfo && (
            <button
              className="btn btn-primary"
              onClick={() => setIsEditingClubInfo(true)}
            >
              編輯
            </button>
          )}
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-3">
          <div
            className="bg-success rounded"
            style={{ width: "100%", height: "200px" }}
          ></div>
        </div>
        <div className="col-md-9">
          <div className="d-flex justify-content-between mb-4">
            <div className="club-info text-start w-100">
              {isEditingClubInfo ? (
                <div>
                  <div className="mb-3">
                    <label htmlFor="clubName" className="form-label fw-bold">
                      社團名稱
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="clubName"
                      value={editedClubInfo.name}
                      onChange={(e) =>
                        setEditedClubInfo((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="clubDescription"
                      className="form-label fw-bold"
                    >
                      社團描述
                    </label>
                    <textarea
                      className="form-control"
                      id="clubDescription"
                      rows={3}
                      value={editedClubInfo.description}
                      onChange={(e) =>
                        setEditedClubInfo((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="maxMembers" className="form-label fw-bold">
                      人數上限
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxMembers"
                      min="1"
                      value={editedClubInfo.maxMembers === 0 ? "" : editedClubInfo.maxMembers}
                      onChange={(e) =>
                        setEditedClubInfo((prev) => ({
                          ...prev,
                          maxMembers: e.target.value === "" ? 0 : Number(e.target.value),
                        }))
                      }
                    />
                    <div className="form-text">
                      目前有效社員人數：{currentMemberCount} 人
                    </div>
                  </div>
                  <p className="mb-2 text-start">
                    創立日期：{clubDetail.foundationDate}
                  </p>
                  <p className="mb-0 text-start">
                    社團狀態：{formatClubStatus(clubDetail.status)}
                  </p>
                  <div className="mt-3">
                    <button
                      className="btn btn-success me-2"
                      onClick={handleSaveClubInfo}
                    >
                      儲存
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setIsEditingClubInfo(false)}
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="mb-3 text-start">{clubDetail.name}</h3>
                  <p className="mb-2 text-start">{clubDetail.description}</p>
                  <p className="mb-2 text-start">
                    創立日期：{clubDetail.foundationDate}
                  </p>
                  <p className="mb-2 text-start">
                    社團人數：{currentMemberCount}/{clubDetail.memberCount.max}
                  </p>
                  <p className="mb-0 text-start">
                    社團狀態：{formatClubStatus(clubDetail.status)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 成員表格 */}
      <div className="table-responsive mb-4">
        <table className="table table-striped text-start">
          <thead>
            <tr>
              <th>成員名稱</th>
              <th>職位</th>
              <th>狀態</th>
              <th>是否幹部</th>
            </tr>
          </thead>
          <tbody>
            {clubDetail.members.map((member) => (
              <tr key={member.id}>
                <td>{member.username}</td>
                <td>{member.position || "-"}</td>
                <td>
                  {member.status === "active" || member.status === "accepted"
                    ? "已加入"
                    : member.status === "pending"
                      ? "待審核"
                      : member.status === "rejected"
                        ? "已拒絕"
                        : member.status}
                </td>
                <td>{member.is_manager ? "是" : "否"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 活動表格 */}
      <div className="table-responsive">
        <table className="table table-striped text-start">
          <thead>
            <tr>
              <th>活動名稱</th>
              <th>日期</th>
              <th>費用</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            {clubDetail.activities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.name}</td>
                <td>{activity.period}</td>
                <td>{activity.fee}</td>
                <td>{activity.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClubDetail;