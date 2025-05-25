import { useEffect, useState } from "react";

interface ActivityFormProps {
  clubId: number | string;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  initialData?: {
    id?: number;
    name?: string;
    description?: string;
    fee?: number;
    quota?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    payment_methods?: any;
  };
}

const ActivityForm = ({
  clubId,
  onClose,
  onSuccess,
  mode,
  initialData,
}: ActivityFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [fee, setFee] = useState(initialData?.fee || 0);
  const [quota, setQuota] = useState(initialData?.quota || 0);
  const [status, setStatus] = useState(initialData?.status || "planning");
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [endDate, setEndDate] = useState(initialData?.end_date || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // payment_methods
  const [cashEnabled, setCashEnabled] = useState(
    !!initialData?.payment_methods?.cash?.enabled
  );
  const [cashRemark, setCashRemark] = useState(
    initialData?.payment_methods?.cash?.remark || ""
  );
  const [bankEnabled, setBankEnabled] = useState(
    !!initialData?.payment_methods?.bankTransfer?.enabled
  );
  const [bankName, setBankName] = useState(
    initialData?.payment_methods?.bankTransfer?.bank || ""
  );
  const [accountNumber, setAccountNumber] = useState(
    initialData?.payment_methods?.bankTransfer?.accountNumber || ""
  );
  const [accountName, setAccountName] = useState(
    initialData?.payment_methods?.bankTransfer?.accountName || ""
  );

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setFee(initialData.fee || 0);
      setQuota(initialData.quota || 0);
      setStatus(initialData.status || "planning");
      setStartDate(initialData.start_date || "");
      setEndDate(initialData.end_date || "");
      setCashEnabled(!!initialData.payment_methods?.cash?.enabled);
      setCashRemark(initialData.payment_methods?.cash?.remark || "");
      setBankEnabled(!!initialData.payment_methods?.bankTransfer?.enabled);
      setBankName(initialData.payment_methods?.bankTransfer?.bank || "");
      setAccountNumber(initialData.payment_methods?.bankTransfer?.accountNumber || "");
      setAccountName(initialData.payment_methods?.bankTransfer?.accountName || "");
    }
    // eslint-disable-next-line
  }, [initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("請輸入活動名稱");
      return;
    }
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("access");

      // 組合 payment_methods
      const payment_methods: any = {};
      if (cashEnabled) {
        payment_methods.cash = {
          enabled: true,
          remark: cashRemark,
        };
      }
      if (bankEnabled) {
        payment_methods.bankTransfer = {
          enabled: true,
          bank: bankName,
          accountNumber,
          accountName,
        };
      }

      let url = `/api/clubs/${clubId}/events/`;
      let method = "POST";
      if (mode === "edit" && initialData?.id) {
        url = `/api/clubs/${clubId}/events/${initialData.id}/`;
        method = "PATCH";
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          fee,
          quota,
          status,
          start_date: startDate,
          end_date: endDate,
          payment_methods,
        }),
      });
      if (!res.ok) throw new Error(mode === "edit" ? "更新活動失敗" : "建立活動失敗");
      onSuccess();
      onClose();
    } catch (err) {
      setError(mode === "edit" ? "更新活動時發生錯誤，請稍後再試" : "建立活動時發生錯誤，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{mode === "edit" ? "編輯活動" : "建立新活動"}</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">活動名稱</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">活動描述</label>
                <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">開始日期</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">結束日期</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">費用</label>
                <input type="number" className="form-control" value={fee} onChange={e => setFee(Number(e.target.value))} min={0} />
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
              <div className="mb-3">
                <label className="form-label">人數上限</label>
                <input
                  type="number"
                  className="form-control"
                  value={quota}
                  onChange={e => setQuota(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">活動狀態</label>
                <select
                  className="form-control"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  required
                >
                  <option value="planning">規劃中</option>
                  <option value="ongoing">進行中</option>
                  <option value="completed">已結束</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>取消</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? mode === "edit"
                      ? "儲存中..."
                      : "建立中..."
                    : mode === "edit"
                      ? "儲存"
                      : "建立活動"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityForm;