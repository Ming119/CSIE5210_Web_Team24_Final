import { useState } from "react";

interface CreateClubFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateClubForm = ({ onClose, onSuccess }: CreateClubFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("社團名稱不能為空");
      return;
    }
    if (maxMembers < 20) {
      setError("社團人數上限必須大於 20");
      return;
    }
    if (maxMembers > 500) {
      setError("社團人數上限不能超過 500");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("access");
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("max_member", String(maxMembers));
      if (image) formData.append("image", image);

      const res = await fetch("/api/clubs/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // 不要加 Content-Type，讓瀏覽器自動帶 boundary
        },
        body: formData,
      });
      if (!res.ok) throw new Error("建立社團失敗");
      onSuccess();
      onClose();
    } catch (err) {
      setError("建立社團時發生錯誤，請稍後再試");
      console.error("建立社團失敗:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxMembersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setMaxMembers(value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">建立新社團</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSubmitting}
              title="關閉"
              aria-label="關閉"
            ></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="clubName" className="form-label fw-bold text-start w-100">
                  社團名稱 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="clubName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  maxLength={100}
                />
                <div className="form-text text-end">{name.length}/100 字元</div>
              </div>

              <div className="mb-3">
                <label htmlFor="clubDescription" className="form-label fw-bold text-start w-100">
                  社團描述
                </label>
                <textarea
                  className="form-control"
                  id="clubDescription"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={500}
                  placeholder="請描述您的社團目標、活動內容等..."
                ></textarea>
                <div className="form-text text-end">{description.length}/500 字元</div>
              </div>

              <div className="mb-3">
                <label htmlFor="maxMembers" className="form-label fw-bold text-start w-100">
                  社團人數上限 <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="maxMembers"
                  min="20"
                  max="200"
                  value={maxMembers}
                  onChange={handleMaxMembersChange}
                  disabled={isSubmitting}
                  required
                />
                <div className="form-text text-end">在 20-200 人之間</div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-start w-100" htmlFor="clubImage">
                  社團圖片
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="clubImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="alert alert-info text-start">
                <small>
                  <strong>注意事項：</strong>
                  <ul className="mb-0 mt-2 text-start">
                    <li>建立後您將自動成為社團社長</li>
                    <li>社團名稱建立後可以修改</li>
                    <li>人數上限可以後續調整</li>
                  </ul>
                </small>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      建立中...
                    </>
                  ) : (
                    "建立社團"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClubForm;
