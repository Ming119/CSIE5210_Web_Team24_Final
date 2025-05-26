import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { type Member } from "../models";
import ActivityForm from "./ActivityForm";

// 型別定義
type PaymentMethods = {
  cash?: {
    enabled: boolean;
    remark?: string;
  };
  bankTransfer?: {
    enabled: boolean;
    bank?: string;
    accountNumber?: string;
    accountName?: string;
  };
};

type Activity = {
  id: number;
  name: string;
  description: string;
  fee: number;
  status: string;
  start_date: string;
  end_date: string;
  quota?: number;
  payment_start_date?: string;
  payment_end_date?: string;
  payment_methods?: PaymentMethods;
  is_public?: boolean;
};

type Participation = {
  id: number;
  user: number;
  username: string;
  payment_method: string;
  payment_status: string;
  is_manager?: boolean;
};

interface ActivityOfficer extends Member {
  isSelected: boolean;
}

const DataFormatter = {
  formatCurrency: (amount: number) => `NT$${amount}`,
  formatDateRange: (start: string, end: string) =>
    `${start} ~ ${end}`,
  formatActivityStatus: (status: string) => {
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
  },
};

const ActivityDetail = () => {
  const { id, clubId } = useParams<{ id: string; clubId: string }>();
if (!clubId) return <div>找不到 clubId</div>;
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState<boolean>(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 報名與參加狀態
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [joinPaymentMethod, setJoinPaymentMethod] = useState("cash");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participation[]>([]);
  const [myMembership, setMyMembership] = useState<{ is_manager: boolean; status?: string } | null>(null);

  // 允許未登入（user_id 可能為 0）
  const userIdStr = localStorage.getItem("user_id");
  const currentUserId = userIdStr && userIdStr !== "0" ? Number(userIdStr) : null;

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!clubId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("access");
        const res = await fetch(`/api/clubs/${clubId}/events/${id}/`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error("無法取得活動資料");
        const activityData = await res.json();
        setActivity({
          ...activityData,
          payment_methods: activityData.payment_methods || {},
        });
        setParticipants(activityData.participants || []);
        // 只有登入時才找 membership/participation
        if (currentUserId) {
          if (activityData.my_membership) {
            setMyMembership(activityData.my_membership);
          } else {
            const found = (activityData.participants || []).find(
              (p: Participation) => p.user === currentUserId
            );
            setMyMembership(found ? { is_manager: !!found.is_manager } : null);
          }
          const myParticipation = (activityData.participants || []).find(
            (p: Participation) => p.user === currentUserId
          );
          setParticipation(myParticipation || null);
        } else {
          setMyMembership(null);
          setParticipation(null);
        }
        setError(null);
      } catch (err) {
        setError("無法載入活動資料。請稍後再試。");
      } finally {
        setLoading(false);
      }
    };
    if (!isNew) fetchActivityData();
  }, [id, clubId, isNew, currentUserId]);

  // 幹部判斷（直接用 membership 的 is_manager 欄位）
  const isManager = !!myMembership?.is_manager;

  // 報名活動
  const handleJoinActivity = async () => {
    setIsJoining(true);
    setJoinError(null);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`/api/events/${activity?.id}/join/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment_method: joinPaymentMethod }),
      });
      if (!res.ok) throw new Error("報名失敗");
      const data = await res.json();
      setParticipation(data);
      setParticipants((prev) => [...prev, data]);
    } catch (err) {
      setJoinError("報名失敗，請稍後再試。");
    } finally {
      setIsJoining(false);
    }
  };

  // 管理員確認付款
  const handleConfirmPayment = async (participantId: number) => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`/api/events/${activity?.id}/participants/${participantId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment_status: "confirmed" }),
      });
      if (!res.ok) throw new Error("確認失敗");
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId ? { ...p, payment_status: "confirmed" } : p
        )
      );
    } catch (err) {
      alert("確認失敗，請稍後再試。");
    }
  };

  const handleRevokePayment = async (participantId: number) => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`/api/events/${activity?.id}/participants/${participantId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment_status: "pending" }),
      });
      if (!res.ok) throw new Error("撤銷失敗");
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId ? { ...p, payment_status: "pending" } : p
        )
      );
    } catch (err) {
      alert("撤銷失敗，請稍後再試。");
    }
  };

  // 顯示已確認人數
  const confirmedCount = participants.filter(p => p.payment_status === "confirmed").length;
  const totalQuota = activity?.quota || 0;

  // 報名資格判斷
  const canJoin =
    !!currentUserId &&
    (activity?.is_public ||
      (myMembership && (myMembership.status === "accepted" || myMembership.status === "active")));

  if (loading) return <div className="text-center">載入中...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!activity) return <div className="alert alert-warning">找不到活動資訊</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-start m-0">活動資訊</h2>
        <div>
          {isManager && (
            <button
              className="btn btn-primary me-2"
              onClick={() => setShowEditModal(true)}
            >
              編輯
            </button>
          )}
          <Link
            to={`/clubs/${clubId}`}
            className="btn btn-outline-secondary me-2"
          >
            返回社團頁面
          </Link>
        </div>
      </div>
      {/* 活動資訊顯示 */}
      <div className="row mb-5">
        <div className="col-md-9">
          <h3 className="mb-3 text-start">{activity.name}</h3>
          <p
            className="mb-3 text-start"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxWidth: "100%",
              overflowWrap: "break-word",
            }}
          >
            {activity.description}
          </p>

          <p className="mb-2 text-start">
            <b>活動日期：</b>{DataFormatter.formatDateRange(activity.start_date, activity.end_date)}
          </p>
          <p className="mb-2 text-start">
            <b>金額：</b>{DataFormatter.formatCurrency(activity.fee)}
          </p>
          {activity.payment_start_date && activity.payment_end_date && (
            <p className="mb-2 text-start">
              <b>繳費日期：</b>{DataFormatter.formatDateRange(activity.payment_start_date, activity.payment_end_date)}
            </p>
          )}
          {/* 顯示繳費方式 */}
          {activity.payment_methods?.cash?.enabled && (
            <p className="mb-2 text-start">
              <b>現金繳費：</b>
              {activity.payment_methods.cash.remark || "請洽主辦人"}
            </p>
          )}
          {activity.payment_methods?.bankTransfer?.enabled && (
            <div className="mb-2 text-start">
              <b>銀行轉帳：</b>
              <div>銀行：{activity.payment_methods.bankTransfer.bank || "-"}</div>
              <div>帳號：{activity.payment_methods.bankTransfer.accountNumber || "-"}</div>
              <div>戶名：{activity.payment_methods.bankTransfer.accountName || "-"}</div>
            </div>
          )}
          <p className="mb-2 text-start">
            <b>對象：</b>
            <span className={`badge ${activity.is_public ? "bg-info" : "bg-secondary"}`}>
              {activity.is_public ? "公開活動" : "社內限定"}
            </span>
          </p>
          <p className="mb-2 text-start">
            <b>狀態：</b>
            <span
              className={`badge ms-0 ${
                activity.status === "open"
                  ? "bg-success"
                  : activity.status === "completed"
                  ? "bg-secondary"
                  : activity.status === "planning"
                  ? "bg-primary"
                  : activity.status === "closed"
                  ? "bg-warning text-dark"
                  : "bg-danger"
              }`}
            >
              {DataFormatter.formatActivityStatus(activity.status)}
            </span>
          </p>
          {/* 額外顯示已確認人數/總名額 */}
          <p className="mt-2 text-start">
            <b>已確認人數：</b>
            <span className="text-success">{confirmedCount}</span>
            <span> / {totalQuota}</span>
          </p>
        </div>
      </div>

      {/* 報名區塊 */}
      {!currentUserId && (
        <div className="alert alert-warning">
          請先登入才能報名活動
        </div>
      )}
      {canJoin && !participation && currentUserId && (
        <div className="alert alert-info">
          <h5>報名參加活動</h5>
          {activity.fee === 0 ? (
            <button
              className="btn btn-primary"
              onClick={handleJoinActivity}
              disabled={isJoining}
            >
              {isJoining ? "報名中..." : "報名參加"}
            </button>
          ) : (
            <>
              {(activity.payment_methods?.cash?.enabled || activity.payment_methods?.bankTransfer?.enabled) ? (
                <>
                  <div className="mb-2">
                    <label className="form-label fw-bold">選擇付款方式：</label>
                    <select
                      className="form-select"
                      value={joinPaymentMethod}
                      onChange={e => setJoinPaymentMethod(e.target.value)}
                    >
                      {activity.payment_methods?.cash?.enabled && <option value="cash">現金</option>}
                      {activity.payment_methods?.bankTransfer?.enabled && <option value="bank">銀行轉帳</option>}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleJoinActivity}
                    disabled={isJoining}
                  >
                    {isJoining ? "報名中..." : "報名參加"}
                  </button>
                </>
              ) : (
                <div className="text-danger">尚未設定繳費方式，請聯絡主辦人</div>
              )}
            </>
          )}
          {joinError && <div className="text-danger mt-2">{joinError}</div>}
        </div>
      )}
      {currentUserId && !canJoin && (
        <div className="alert alert-warning">
          僅限社員報名此活動
        </div>
      )}

      {/* 參加者列表 */}
      {isManager && participants.length > 0 && (
        <div className="mt-4">
          <h5>參加者列表</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>姓名</th>
                <th>付款方式</th>
                <th>付款狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id}>
                  <td>{p.username}</td>
                  <td>{p.payment_method === "cash" ? "現金" : "銀行轉帳"}</td>
                  <td>
                    {p.payment_status === "confirmed"
                      ? <span className="badge bg-success">已確認</span>
                      : <span className="badge bg-warning text-dark">待確認</span>
                    }
                  </td>
                  <td>
                    {p.payment_status !== "confirmed" ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleConfirmPayment(p.id)}
                      >
                        確認
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRevokePayment(p.id)}
                      >
                        撤銷
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 編輯 Modal */}
      {showEditModal && (
        <ActivityForm
          mode="edit"
          clubId={clubId ?? ""}
          initialData={activity}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default ActivityDetail;