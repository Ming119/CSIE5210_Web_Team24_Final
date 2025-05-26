import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { type Member } from "../models";

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
        return "規劃中";
      case "ongoing":
        return "進行中";
      case "completed":
        return "已結束";
      case "cancelled":
        return "已取消";
      default:
        return status;
    }
  },
};

const ActivityEditModal = ({
  activity,
  clubId,
  officers,
  onClose,
  onSuccess,
}: {
  activity: Activity;
  clubId: string | undefined;
  officers: ActivityOfficer[];
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [form, setForm] = useState<Activity>({ ...activity });
  const [cashEnabled, setCashEnabled] = useState(!!activity.payment_methods?.cash?.enabled);
  const [cashRemark, setCashRemark] = useState(activity.payment_methods?.cash?.remark || "");
  const [bankEnabled, setBankEnabled] = useState(!!activity.payment_methods?.bankTransfer?.enabled);
  const [bankName, setBankName] = useState(activity.payment_methods?.bankTransfer?.bank || "");
  const [accountNumber, setAccountNumber] = useState(activity.payment_methods?.bankTransfer?.accountNumber || "");
  const [accountName, setAccountName] = useState(activity.payment_methods?.bankTransfer?.accountName || "");
  const [isPublic, setIsPublic] = useState(!!activity.is_public);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      payment_methods: {
        cash: cashEnabled ? { enabled: true, remark: cashRemark } : undefined,
        bankTransfer: bankEnabled
          ? { enabled: true, bank: bankName, accountNumber, accountName }
          : undefined,
      },
      is_public: isPublic,
    }));
    // eslint-disable-next-line
  }, [cashEnabled, cashRemark, bankEnabled, bankName, accountNumber, accountName, isPublic]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "fee" ? Number(value) : value,
    });
  };

  const handleDateChange = (field: keyof Activity, value: string) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("access");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/clubs/${clubId}/events/${activity.id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("儲存活動失敗");
      onSuccess();
      onClose();
    } catch (err) {
      setError("儲存活動時發生錯誤，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">編輯活動</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">活動名稱</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">活動描述</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  maxLength={500}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">開始日期</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.start_date}
                  onChange={e => handleDateChange("start_date", e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">結束日期</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.end_date}
                  onChange={e => handleDateChange("end_date", e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">費用</label>
                <input
                  type="number"
                  className="form-control"
                  name="fee"
                  value={form.fee}
                  onChange={handleInputChange}
                  min={0}
                />
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isPublic">
                  對外公開
                </label>
              </div>
              <label className="form-label fw-bold">繳費方式</label>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="cash"
                  checked={cashEnabled}
                  onChange={e => setCashEnabled(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="cash">
                  現金
                </label>
              </div>
              {cashEnabled && (
                <div className="mb-2 ms-4">
                  <input
                    className="form-control"
                    placeholder="現金繳費說明（如：請於活動現場繳交）"
                    value={cashRemark}
                    onChange={e => setCashRemark(e.target.value)}
                  />
                </div>
              )}
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="bankTransfer"
                  checked={bankEnabled}
                  onChange={e => setBankEnabled(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="bankTransfer">
                  銀行轉帳
                </label>
              </div>
              {bankEnabled && (
                <div className="mb-2 ms-4">
                  <input
                    className="form-control mb-1"
                    placeholder="銀行名稱"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                  />
                  <input
                    className="form-control mb-1"
                    placeholder="帳號"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                  />
                  <input
                    className="form-control"
                    placeholder="戶名"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                  />
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>取消</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "儲存中..." : "儲存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityDetail = () => {
  const { id, clubId } = useParams<{ id: string; clubId: string }>();
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

  const currentUserId = Number(localStorage.getItem("user_id") || 0);

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
        // 取得自己 membership（假設後端有回傳 my_membership，否則請從 participants 找）
        if (activityData.my_membership) {
          setMyMembership(activityData.my_membership);
        } else {
          // 從 participants 找
          const found = (activityData.participants || []).find(
            (p: Participation) => p.user === currentUserId
          );
          setMyMembership(found ? { is_manager: !!found.is_manager } : null);
        }
        // 取得自己參加狀態
        const myParticipation = (activityData.participants || []).find(
          (p: Participation) => p.user === currentUserId
        );
        setParticipation(myParticipation || null);
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

  // 顯示已確認人數
  const confirmedCount = participants.filter(p => p.payment_status === "confirmed").length;
  const totalQuota = activity?.quota || 0;

  // 報名資格判斷
  const canJoin =
    activity?.is_public ||
    (myMembership && (myMembership.status === "accepted" || myMembership.status === "active"));

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
            className="btn btn-outline-secondary"
          >
            返回社團頁面
          </Link>
        </div>
      </div>
      {/* 活動資訊顯示 */}
      <div className="row mb-5">
        <div className="col-md-9">
          <h3 className="mb-3 text-start">{activity.name}</h3>
          <p className="mb-3 text-start">{activity.description}</p>
          <p className="mb-2 text-start">
            金額：{DataFormatter.formatCurrency(activity.fee)}
          </p>
          <p className="mb-2 text-start">
            活動日期：{DataFormatter.formatDateRange(activity.start_date, activity.end_date)}
          </p>
          {activity.payment_start_date && activity.payment_end_date && (
            <p className="mb-2 text-start">
              繳費日期：{DataFormatter.formatDateRange(activity.payment_start_date, activity.payment_end_date)}
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
            <span className={`badge ${activity.is_public ? "bg-info" : "bg-secondary"}`}>
              {activity.is_public ? "公開活動" : "社內限定"}
            </span>
          </p>
          <p className="mb-0 text-start">
            狀態：
            <span
              className={`badge ms-2 ${activity.status === "ongoing"
                ? "bg-success"
                : activity.status === "completed"
                  ? "bg-secondary"
                  : activity.status === "planning"
                    ? "bg-primary"
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
      {canJoin && !participation && (
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
                    <label className="form-label">選擇付款方式：</label>
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
      {!canJoin && (
        <div className="alert alert-warning">
          僅限社員報名此活動
        </div>
      )}

      {/* 參加者列表 */}
      {participants.length > 0 && (
        <div className="mt-4">
          <h5>參加者列表</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>姓名</th>
                <th>付款方式</th>
                <th>付款狀態</th>
                {isManager && <th>操作</th>}
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
                  {isManager && (
                    <td>
                      {p.payment_status !== "confirmed" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleConfirmPayment(p.id)}
                        >
                          確認
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 編輯 Modal */}
      {showEditModal && (
        <ActivityEditModal
          activity={activity}
          clubId={clubId}
          officers={[]} // 不再用 officers 判斷權限
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default ActivityDetail;