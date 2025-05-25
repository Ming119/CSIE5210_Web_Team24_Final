import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { type Activity, type Member } from "../models";

// 活動負責人介面（僅用於此組件）
interface ActivityOfficer extends Member {
  isSelected: boolean;
}

const DataFormatter = {
  formatCurrency: (amount: number) => `NT$${amount}`,
  formatDateRange: (period: { startDate: Date; endDate: Date }) =>
    `${period.startDate.toLocaleDateString()} ~ ${period.endDate.toLocaleDateString()}`,
  formatActivityStatus: (status: string) => {
    switch (status) {
      case "planning":
        return "規劃中";
      case "ongoing":
        return "進行中";
      case "completed":
        return "已結束";
      default:
        return status;
    }
  },
};

const ActivityDetail = () => {
  const { id, clubId } = useParams<{ id: string; clubId: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [isEditMode, setIsEditMode] = useState<boolean>(isNew);
  const [loading, setLoading] = useState<boolean>(!isNew);
  const [error, setError] = useState<string | null>(null);

  const [activity, setActivity] = useState<Activity | null>(null);
  const [officers, setOfficers] = useState<ActivityOfficer[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bankTransfer">(
    "cash"
  );

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    fee?: string;
    startDate?: string;
    endDate?: string;
    paymentStartDate?: string;
    paymentEndDate?: string;
  }>({});

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!clubId) return;

      try {
        setLoading(true);

        if (isNew) {
          // 建立新活動的預設資料
          const now = new Date();
          const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30天後

          const newActivity: Activity = {
            id: 0,
            name: "",
            description: "",
            period: {
              startDate: now,
              endDate: endDate,
            },
            paymentPeriod: {
              startDate: now,
              endDate: endDate,
            },
            fee: 0,
            status: "planning",
            paymentMethods: {
              cash: false,
              bankTransfer: false,
            },
          };

          setActivity(newActivity);
          setOfficers([]);
        } else {
          // 從後端取得活動資料
          const res = await fetch(`/api/clubs/${clubId}/events/${id}/`, {
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error("無法取得活動資料");
          const activityData = await res.json();

          // 日期欄位轉換
          setActivity({
            ...activityData,
            period: {
              startDate: new Date(activityData.period.startDate),
              endDate: new Date(activityData.period.endDate),
            },
            paymentPeriod: {
              startDate: new Date(activityData.paymentPeriod.startDate),
              endDate: new Date(activityData.paymentPeriod.endDate),
            },
          });

          // 從後端取得負責人資料（假設API有提供，否則可根據活動資料取得）
          if (activityData.officers) {
            setOfficers(
              activityData.officers.map((officer: Member) => ({
                ...officer,
                isSelected: true,
              }))
            );
          } else {
            setOfficers([]);
          }
        }
        setError(null);
      } catch (err) {
        console.error("載入活動資料時發生錯誤:", err);
        setError("無法載入活動資料。請稍後再試。");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [id, clubId, isNew]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!activity) return;

    const { name, value } = e.target;

    if (name === "fee") {
      const numericValue = parseFloat(value) || 0;
      setActivity({
        ...activity,
        fee: numericValue,
      });
    } else {
      setActivity({
        ...activity,
        [name]: value,
      });
    }
  };

  const handleDateChange = (field: string, value: string) => {
    if (!activity) return;

    const date = new Date(value);
    if (isNaN(date.getTime())) return;

    if (field.startsWith("payment")) {
      const isStartDate = field === "paymentStartDate";
      setActivity({
        ...activity,
        paymentPeriod: {
          ...activity.paymentPeriod,
          [isStartDate ? "startDate" : "endDate"]: date,
        },
      });
    } else {
      const isStartDate = field === "startDate";
      setActivity({
        ...activity,
        period: {
          ...activity.period,
          [isStartDate ? "startDate" : "endDate"]: date,
        },
      });
    }
  };

  const handlePaymentMethodChange = (
    method: keyof Activity["paymentMethods"],
    checked: boolean
  ) => {
    if (!activity) return;

    setActivity({
      ...activity,
      paymentMethods: {
        ...activity.paymentMethods,
        [method]: checked,
      },
    });
  };

  const handleBankInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activity) return;

    const { name, value } = e.target;
    setActivity({
      ...activity,
      bankInfo: {
        ...activity.bankInfo,
        [name]: value,
      } as Activity["bankInfo"],
    });
  };

  const handleCashInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activity) return;

    const { name, value } = e.target;
    setActivity({
      ...activity,
      cashInfo: {
        ...activity.cashInfo,
        [name]: value,
      } as Activity["cashInfo"],
    });
  };

  const handleOfficerSelection = (officerId: number, isSelected: boolean) => {
    setOfficers((prevOfficers) =>
      prevOfficers.map((officer) =>
        officer.id === officerId ? { ...officer, isSelected } : officer
      )
    );
  };

  const validateForm = (): boolean => {
    if (!activity) return false;

    const errors: typeof formErrors = {};

    if (!activity.name?.trim()) {
      errors.name = "請輸入活動名稱";
    }

    if (activity.fee < 0) {
      errors.fee = "金額不能為負數";
    }

    if (activity.period.startDate >= activity.period.endDate) {
      errors.startDate = "活動開始日期必須早於結束日期";
    }

    if (activity.paymentPeriod.startDate >= activity.paymentPeriod.endDate) {
      errors.paymentStartDate = "繳費開始日期必須早於結束日期";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
  if (!activity || !clubId) return;

  if (!validateForm()) {
    return;
  }

  try {
    setLoading(true);

    // 準備要送出的資料（根據你的後端 serializer 格式調整）
    const payload = {
      ...activity,
      period: {
        startDate: activity.period.startDate.toISOString().slice(0, 10),
        endDate: activity.period.endDate.toISOString().slice(0, 10),
      },
      paymentPeriod: {
        startDate: activity.paymentPeriod.startDate.toISOString().slice(0, 10),
        endDate: activity.paymentPeriod.endDate.toISOString().slice(0, 10),
      },
      officers: officers.filter((o) => o.isSelected).map((o) => o.id),
    };

    const token = localStorage.getItem("access");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let url = `/api/clubs/${clubId}/events/`;
    let method = "POST";
    if (!isNew) {
      url = `/api/clubs/${clubId}/events/${id}/`;
      method = "PATCH";
    }

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("儲存活動失敗");

    setIsEditMode(false);

    // 如果是新活動，儲存後導航回社團頁面
    if (isNew) {
      navigate(`/clubs/${clubId}`);
    }
  } catch (error) {
    console.error("儲存活動失敗:", error);
    setError("儲存活動時發生錯誤，請稍後再試。");
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    if (isNew) {
      navigate(`/clubs/${clubId}`);
    } else {
      setIsEditMode(false);
    }
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  if (loading) {
    return <div className="text-center">載入中...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!activity) {
    return <div className="alert alert-warning">找不到活動資訊</div>;
  }

  const renderActivityInfo = () => {
    if (isEditMode) {
      return (
        <div className="row mb-5">
          <div className="col-md-3">
            <div
              className="bg-success rounded"
              style={{ width: "100%", height: "200px" }}
            ></div>
          </div>
          <div className="col-md-9">
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-bold">
                活動名稱 <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  formErrors.name ? "is-invalid" : ""
                }`}
                id="name"
                name="name"
                value={activity.name}
                onChange={handleInputChange}
                maxLength={100}
              />
              {formErrors.name && (
                <div className="invalid-feedback">{formErrors.name}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label fw-bold">
                活動描述
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows={4}
                value={activity.description}
                onChange={handleInputChange}
                maxLength={500}
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="fee" className="form-label fw-bold">
                金額 (元)
              </label>
              <input
                type="number"
                className={`form-control ${formErrors.fee ? "is-invalid" : ""}`}
                id="fee"
                name="fee"
                min="0"
                step="1"
                value={activity.fee}
                onChange={handleInputChange}
              />
              <div className="form-text">輸入 0 表示免費活動</div>
              {formErrors.fee && (
                <div className="invalid-feedback">{formErrors.fee}</div>
              )}
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="startDate" className="form-label fw-bold">
                  活動開始日期 <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${
                    formErrors.startDate ? "is-invalid" : ""
                  }`}
                  id="startDate"
                  value={formatDateForInput(activity.period.startDate)}
                  onChange={(e) =>
                    handleDateChange("startDate", e.target.value)
                  }
                />
                {formErrors.startDate && (
                  <div className="invalid-feedback">{formErrors.startDate}</div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="endDate" className="form-label fw-bold">
                  活動結束日期 <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${
                    formErrors.endDate ? "is-invalid" : ""
                  }`}
                  id="endDate"
                  value={formatDateForInput(activity.period.endDate)}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label
                  htmlFor="paymentStartDate"
                  className="form-label fw-bold"
                >
                  繳費開始日期 <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${
                    formErrors.paymentStartDate ? "is-invalid" : ""
                  }`}
                  id="paymentStartDate"
                  value={formatDateForInput(activity.paymentPeriod.startDate)}
                  onChange={(e) =>
                    handleDateChange("paymentStartDate", e.target.value)
                  }
                />
                {formErrors.paymentStartDate && (
                  <div className="invalid-feedback">
                    {formErrors.paymentStartDate}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="paymentEndDate" className="form-label fw-bold">
                  繳費結束日期 <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${
                    formErrors.paymentEndDate ? "is-invalid" : ""
                  }`}
                  id="paymentEndDate"
                  value={formatDateForInput(activity.paymentPeriod.endDate)}
                  onChange={(e) =>
                    handleDateChange("paymentEndDate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="row mb-5">
          <div className="col-md-3">
            <div
              className="bg-success rounded"
              style={{ width: "100%", height: "200px" }}
            ></div>
          </div>
          <div className="col-md-9">
            <h3 className="mb-3 text-start">{activity.name}</h3>
            <p className="mb-3 text-start">{activity.description}</p>
            <p className="mb-2 text-start">
              金額：{DataFormatter.formatCurrency(activity.fee)}
            </p>
            <p className="mb-2 text-start">
              活動日期：{DataFormatter.formatDateRange(activity.period)}
            </p>
            <p className="mb-2 text-start">
              繳費日期：{DataFormatter.formatDateRange(activity.paymentPeriod)}
            </p>
            <p className="mb-0 text-start">
              狀態：
              <span
                className={`badge ms-2 ${
                  activity.status === "ongoing"
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
          </div>
        </div>
      );
    }
  };

  const renderPaymentMethods = () => {
    if (isEditMode) {
      return (
        <div className="mb-5">
          <h4 className="mb-3 text-start">付款方式</h4>

          <div className="mb-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="cashEnabled"
                checked={activity.paymentMethods.cash}
                onChange={(e) =>
                  handlePaymentMethodChange("cash", e.target.checked)
                }
              />
              <label className="form-check-label" htmlFor="cashEnabled">
                現金付款
              </label>
            </div>

            {activity.paymentMethods.cash && (
              <div className="card p-3 mt-2">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="schedule" className="form-label">
                      時間安排
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="schedule"
                      name="schedule"
                      value={activity.cashInfo?.schedule || ""}
                      onChange={handleCashInfoChange}
                      placeholder="例如: 星期一—至五13:00-15:00"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label">
                      地點
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={activity.cashInfo?.location || ""}
                      onChange={handleCashInfoChange}
                      placeholder="例如: 社辦"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="bankTransferEnabled"
                checked={activity.paymentMethods.bankTransfer}
                onChange={(e) =>
                  handlePaymentMethodChange("bankTransfer", e.target.checked)
                }
              />
              <label className="form-check-label" htmlFor="bankTransferEnabled">
                銀行轉帳
              </label>
            </div>

            {activity.paymentMethods.bankTransfer && (
              <div className="card p-3 mt-2">
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="bank" className="form-label">
                      銀行
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="bank"
                      name="bank"
                      value={activity.bankInfo?.bank || ""}
                      onChange={handleBankInfoChange}
                      placeholder="例如: 700(中華郵政)"
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="accountNumber" className="form-label">
                      帳號
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="accountNumber"
                      name="accountNumber"
                      value={activity.bankInfo?.accountNumber || ""}
                      onChange={handleBankInfoChange}
                      placeholder="例如: 0001236 06254481"
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="accountName" className="form-label">
                      戶名
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="accountName"
                      name="accountName"
                      value={activity.bankInfo?.accountName || ""}
                      onChange={handleBankInfoChange}
                      placeholder="例如: 陳大文"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="mb-5">
          <h4 className="mb-4 text-start">付款方式</h4>
          <div className="mb-3">
            {activity.paymentMethods.cash && (
              <div className="row mb-3 align-items-center">
                <div className="col-md-2 text-start">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="cashPayment"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    <label className="form-check-label" htmlFor="cashPayment">
                      現金
                    </label>
                  </div>
                </div>
                <div className="col-md-5 text-start">
                  <p className="mb-0 text-start">
                    時間：{activity.cashInfo?.schedule || "未設定"}
                  </p>
                </div>
                <div className="col-md-5 text-start">
                  <p className="mb-0 text-start">
                    地點：{activity.cashInfo?.location || "未設定"}
                  </p>
                </div>
              </div>
            )}

            {activity.paymentMethods.bankTransfer && (
              <div className="row mb-3 align-items-center">
                <div className="col-md-2 text-start">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="bankTransfer"
                      checked={paymentMethod === "bankTransfer"}
                      onChange={() => setPaymentMethod("bankTransfer")}
                    />
                    <label className="form-check-label" htmlFor="bankTransfer">
                      銀行轉帳
                    </label>
                  </div>
                </div>
                <div className="col-md-3 text-start">
                  <p className="mb-0 text-start">
                    銀行：{activity.bankInfo?.bank || "未設定"}
                  </p>
                </div>
                <div className="col-md-4 text-start">
                  <p className="mb-0 text-start">
                    帳號：{activity.bankInfo?.accountNumber || "未設定"}
                  </p>
                </div>
                <div className="col-md-3 text-start">
                  <p className="mb-0 text-start">
                    戶名：{activity.bankInfo?.accountName || "未設定"}
                  </p>
                </div>
              </div>
            )}

            {activity.fee > 0 &&
              (activity.paymentMethods.cash ||
                activity.paymentMethods.bankTransfer) && (
                <div className="mt-4 text-start">
                  <button className="btn btn-primary">
                    付款 {DataFormatter.formatCurrency(activity.fee)}
                  </button>
                </div>
              )}
          </div>
        </div>
      );
    }
  };

  const renderOfficerInfo = () => {
    if (isEditMode) {
      return (
        <div>
          <h4 className="mb-3 text-start">負責人資訊</h4>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th className="text-start" style={{ width: "50px" }}>
                    選擇
                  </th>
                  <th className="text-start">幹部名稱</th>
                  <th className="text-start">職位</th>
                  <th className="text-start">聯絡電話</th>
                  <th className="text-start">電郵</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr key={officer.id}>
                    <td className="text-start">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={officer.isSelected}
                        onChange={(e) =>
                          handleOfficerSelection(officer.id, e.target.checked)
                        }
                        title={`選擇 ${officer.name}`}
                        aria-label={`選擇 ${officer.name}`}
                      />
                    </td>
                    <td className="text-start">{officer.name}</td>
                    <td className="text-start">{officer.position}</td>
                    <td className="text-start">{officer.phone}</td>
                    <td className="text-start">{officer.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      const selectedOfficers = officers.filter((officer) => officer.isSelected);

      return (
        <div>
          <h4 className="mb-4 text-start">負責人資訊</h4>
          {selectedOfficers.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th className="text-start">幹部名稱</th>
                    <th className="text-start">職位</th>
                    <th className="text-start">聯絡電話</th>
                    <th className="text-start">電郵</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOfficers.map((officer) => (
                    <tr key={officer.id}>
                      <td className="text-start">{officer.name}</td>
                      <td className="text-start">{officer.position}</td>
                      <td className="text-start">{officer.phone}</td>
                      <td className="text-start">{officer.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">暫無指定負責人</div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-start m-0">{isNew ? "建立新活動" : "活動資訊"}</h2>
        <div>
          {!isEditMode ? (
            <>
              <button
                className="btn btn-primary me-2"
                onClick={() => setIsEditMode(true)}
              >
                編輯
              </button>
              <Link
                to={`/clubs/${clubId}`}
                className="btn btn-outline-secondary"
              >
                返回社團頁面
              </Link>
            </>
          ) : (
            <>
              <button
                className="btn btn-success me-2"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "儲存中..." : "儲存"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                取消
              </button>
            </>
          )}
        </div>
      </div>

      {renderActivityInfo()}
      {renderPaymentMethods()}
      {renderOfficerInfo()}
    </div>
  );
};

export default ActivityDetail;
