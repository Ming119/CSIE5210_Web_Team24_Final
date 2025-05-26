import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ActivityForm from "./ActivityForm";

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
  start_date: string;
  end_date: string;
  fee: number;
  quota: number;
  status: string;
  description?: string;
  payment_methods?: any;
  is_public?: boolean;
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

const CLUB_POSITIONS = [
  "社長",
  "副社長",
  "活動幹部",
  "財務幹部",
  "公關幹部",
  "社員",
];

const MANAGER_POSITIONS = [
  "社長",
  "副社長",
  "活動幹部",
  "財務幹部",
  "公關幹部",
];

const ClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clubDetail, setClubDetail] = useState<ClubDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingClubInfo, setIsEditingClubInfo] = useState(false);
  const [editedClubInfo, setEditedClubInfo] = useState({
    name: "",
    description: "",
    maxMembers: 0,
  });
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [showEditActivity, setShowEditActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const currentUserId = Number(localStorage.getItem("user_id") || 0);

  const fetchClubDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${id}/`);
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

  useEffect(() => {
    fetchClubDetail();
    // eslint-disable-next-line
  }, [id]);

  if (loading) return <div className="text-center">載入中...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!clubDetail) return <div className="alert alert-warning">找不到社團資訊</div>;

  // 取得自己在這個社團的 membership（包含 pending 狀態）
  const myMembership = clubDetail.members.find(m => m.user === currentUserId);

  // 幹部判斷
  const isManager = myMembership &&
    (myMembership.is_manager ||
      (myMembership.position && MANAGER_POSITIONS.includes(myMembership.position)));

  // 只顯示有效社員數
  const currentMemberCount = clubDetail.members.filter(
    (member) => member.status === "accepted"
  ).length;

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

  // 更新成員職位或狀態
  const handleUpdateMember = async (memberId: number, update: { position?: string; status?: string }) => {
    if (!clubDetail) return;
    try {
      const token = localStorage.getItem("access");
      // 根據 position 自動設定 is_manager
      let isManagerValue: boolean | undefined = undefined;
      if (update.position !== undefined) {
        isManagerValue = MANAGER_POSITIONS.includes(update.position);
      }
      const body: any = { ...update };
      if (isManagerValue !== undefined) {
        body.is_manager = isManagerValue;
      }
      const res = await fetch(`/api/memberships/${memberId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("更新失敗");
      await fetchClubDetail();
    } catch (err) {
      alert("更新失敗，請稍後再試。");
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowEditActivity(true);
  };

  // 申請加入社團
  const handleJoinClub = async () => {
    if (!clubDetail) return;
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`/api/clubs/${clubDetail.id}/join/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("申請加入失敗");
      await fetchClubDetail();
      alert("申請已送出，請等待審核");
    } catch (err) {
      alert("申請加入失敗，請稍後再試。");
    }
  };

  // 撤回申請
  const handleWithdraw = async () => {
    if (!myMembership) return;
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`/api/memberships/${myMembership.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("撤回申請失敗");
      await fetchClubDetail();
      alert("已撤回申請");
    } catch (err) {
      alert("撤回申請失敗，請稍後再試。");
    }
  };

  // 退出社團
  const handleQuit = async () => {
    if (!myMembership) return;
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`/api/memberships/${myMembership.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("退出社團失敗");
      await fetchClubDetail();
      alert("已退出社團");
    } catch (err) {
      alert("退出社團失敗，請稍後再試。");
    }
  };

  // 活動狀態顯示
  const formatActivityStatus = (status: string) => {
    switch (status) {
      case "planning":
        return "尚未接受報名";
      case "open":
        return "接受報名中";
      case "closed":
        return "已截止報名";
      case "completed":
        return "已結束";
      case "cancelled":
        return "已取消";
      default:
        return status;
    }
  };

  // 顯示所有成員（包含 pending 狀態）
  const membersForTable = clubDetail.members;

  // 決定顯示哪個按鈕
  let joinButton = null;
  if (!myMembership) {
    joinButton = (
      <button className="btn btn-primary" onClick={handleJoinClub}>
        加入社團
      </button>
    );
  } else if (myMembership.status === "pending") {
    joinButton = (
      <button className="btn btn-warning" onClick={handleWithdraw}>
        撤回申請
      </button>
    );
  } else if (myMembership.status === "accepted" || myMembership.status === "active") {
    joinButton = (
      <button className="btn btn-danger" onClick={handleQuit}>
        退出社團
      </button>
    );
  }

  const formatClubStatus = (status: string) => {
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
  };


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-start m-0">社團資訊</h2>
        <div>
          {isManager && !isEditingClubInfo && (
            <button
              className="btn btn-primary me-2"
              onClick={() => setIsEditingClubInfo(true)}
            >
              編輯
            </button>
          )}
          <Link to="/" className="btn btn-outline-secondary me-2">
            返回社團列表
          </Link>
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
                  {/* 動態顯示加入/撤回/退出按鈕 */}
                  <div className="mt-3">{joinButton}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 成員表格 */}
      {isManager && (
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
              {membersForTable.map((member) => (
                <tr key={member.id}>
                  <td>{member.username}</td>
                  <td>
                    {isManager ? (
                      <select
                        value={member.position || ""}
                        onChange={e => handleUpdateMember(member.id, { position: e.target.value })}
                      >
                        <option value="">無</option>
                        {CLUB_POSITIONS.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    ) : (
                      member.position || "-"
                    )}
                  </td>
                  <td>
                    {isManager ? (
                      <select
                        value={member.status}
                        onChange={e => handleUpdateMember(member.id, { status: e.target.value })}
                      >
                        <option value="pending">待審核</option>
                        <option value="accepted">已加入</option>
                        <option value="rejected">已拒絕</option>
                        <option value="left">已退出</option>
                      </select>
                    ) : (
                      member.status === "active" || member.status === "accepted"
                        ? "已加入"
                        : member.status === "pending"
                          ? "待審核"
                          : member.status === "rejected"
                            ? "已拒絕"
                            : member.status === "left"
                              ? "已退出"
                              : member.status
                    )}
                  </td>
                  <td>
                    {member.is_manager ||
                      (member.position && MANAGER_POSITIONS.includes(member.position))
                      ? "是"
                      : "否"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 活動表格上方新增活動按鈕 */}
      {isManager && (
        <div className="mb-3 text-end">
          <button
            className="btn btn-success"
            onClick={() => setShowCreateActivity(true)}
          >
            新增活動
          </button>
        </div>
      )}


      <div className="table-responsive">
        <table className="table table-striped text-start">
          <thead>
            <tr>
              <th>活動名稱</th>
              <th>內容</th>
              <th>日期</th>
              <th>費用</th>
              <th>名額</th>
              <th>狀態</th>
              <th>公開</th>
              {isManager && <th>操作</th>}
            </tr>
          </thead>
          <tbody>
            {clubDetail.activities.map((activity) => (
              <tr key={activity.id}>
                <td>
                  <Link to={`/clubs/${clubDetail.id}/activities/${activity.id}`}>
                    {activity.name}
                  </Link>
                </td>
                <td
                  style={{
                    maxWidth: 200,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                  title={activity.description}
                >
                  {activity.description && activity.description.length > 30
                    ? activity.description.slice(0, 30) + "..."
                    : activity.description}
                </td>
                <td>
                  {activity.start_date && activity.end_date
                    ? `${activity.start_date} - ${activity.end_date}`
                    : "-"}
                </td>
                <td>{activity.fee}</td>
                <td>{activity.quota}</td>
                <td>{formatActivityStatus(activity.status)}</td>
                <td>{activity.is_public ? "公開" : "社內"}</td>
                {isManager && (
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEditActivity(activity)}
                    >
                      編輯
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 彈出建立活動表單 */}
      {showCreateActivity && (
        <ActivityForm
          mode="create"
          clubId={clubDetail.id}
          onClose={() => setShowCreateActivity(false)}
          onSuccess={() => {
            setShowCreateActivity(false);
            fetchClubDetail();
          }}
        />
      )}

      {/* 彈出編輯活動表單 */}
      {showEditActivity && editingActivity && (
        <ActivityForm
          mode="edit"
          clubId={clubDetail.id}
          initialData={editingActivity}
          onClose={() => setShowEditActivity(false)}
          onSuccess={() => {
            setShowEditActivity(false);
            fetchClubDetail();
          }}
        />
      )}
    </div>
  );
};

export default ClubDetail;