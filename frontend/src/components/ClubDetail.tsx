import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ClubService, DataFormatter, type ClubDetailData } from "../api";
import { type Member } from "../models";

const ClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clubDetail, setClubDetail] = useState<ClubDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingClubInfo, setIsEditingClubInfo] = useState<boolean>(false);
  const [editedClubInfo, setEditedClubInfo] = useState<{
    name: string;
    description: string;
    maxMembers: number;
  }>({
    name: "",
    description: "",
    maxMembers: 0,
  });

  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingMemberPosition, setEditingMemberPosition] =
    useState<string>("");

  // 可選的職位列表
  const availablePositions = [
    "社長",
    "副社長",
    "活動幹部",
    "財務幹部",
    "公關幹部",
    "社員",
  ];

  const hasManagementPermission = (userRole?: string): boolean => {
    return userRole === "社長" || userRole === "副社長" || userRole === "幹部";
  };

  const hasPresidentPermission = (userRole?: string): boolean => {
    return userRole === "社長";
  };

  const hasApprovalPermission = (userRole?: string): boolean => {
    return userRole === "社長" || userRole === "副社長";
  };

  const calculateCurrentMemberCount = (members: Member[]): number => {
    return members.filter((member) => member.status === "active").length;
  };

  useEffect(() => {
    const fetchClubDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await ClubService.getClubDetail(Number(id));

        setClubDetail(data);
        setEditedClubInfo({
          name: data.name,
          description: data.description,
          maxMembers: data.memberCount.max,
        });
        setError(null);
      } catch (err) {
        console.error("獲取社團詳情時發生錯誤:", err);
        setError("無法載入社團詳情。請稍後再試。");
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetail();
  }, [id]);

  const handleMemberStatusChange = async (
    memberId: number,
    memberName: string,
    newStatus: Member["status"]
  ) => {
    if (!id) return;

    try {
      await ClubService.updateMemberStatus(Number(id), memberId, newStatus);
      console.log(
        `將成員 ${memberName} 的狀態變更為 ${DataFormatter.formatMemberStatus(
          newStatus
        )}`
      );

      const updatedData = await ClubService.getClubDetail(Number(id));
      setClubDetail(updatedData);
    } catch (error) {
      console.error("更新成員狀態失敗:", error);
    }
  };

  const handleStartEditMember = (memberId: number, currentPosition: string) => {
    setEditingMemberId(memberId);
    setEditingMemberPosition(currentPosition);
  };

  const handleSaveMemberPosition = async (
    memberId: number,
    memberName: string
  ) => {
    if (!id || !editingMemberPosition.trim()) return;

    try {
      // 這裡應該調用 API 來更新成員職位
      // 目前先用 console.log 模擬
      console.log(`將成員 ${memberName} 的職位變更為 ${editingMemberPosition}`);

      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 重新載入社團資料
      const updatedData = await ClubService.getClubDetail(Number(id));
      setClubDetail(updatedData);

      // 重置編輯狀態
      setEditingMemberId(null);
      setEditingMemberPosition("");
    } catch (error) {
      console.error("更新成員職位失敗:", error);
    }
  };

  const handleCancelEditMember = () => {
    setEditingMemberId(null);
    setEditingMemberPosition("");
  };

  const handleEditActivity = (activityId: number) => {
    if (id) {
      navigate(`/clubs/${id}/activities/${activityId}`);
    }
  };

  const handleAddActivity = () => {
    if (id) {
      navigate(`/clubs/${id}/activities/new`);
    }
  };

  const handleEditClubInfo = () => {
    setIsEditingClubInfo(true);
  };

  const handleSaveClubInfo = async () => {
    if (!id || !clubDetail) return;

    try {
      const currentMemberCount = calculateCurrentMemberCount(
        clubDetail.members
      );

      const updateData = {
        name: editedClubInfo.name,
        description: editedClubInfo.description,
        memberCount: {
          current: currentMemberCount,
          max: editedClubInfo.maxMembers,
        },
      };

      await ClubService.updateClubInfo(Number(id), updateData);

      const updatedClubDetail = {
        ...clubDetail,
        name: editedClubInfo.name,
        description: editedClubInfo.description,
        memberCount: {
          current: currentMemberCount,
          max: editedClubInfo.maxMembers,
        },
      };
      setClubDetail(updatedClubDetail);

      setIsEditingClubInfo(false);
    } catch (error) {
      console.error("更新社團資訊失敗:", error);
    }
  };

  const handleCancelEditClubInfo = () => {
    if (clubDetail) {
      setEditedClubInfo({
        name: clubDetail.name,
        description: clubDetail.description,
        maxMembers: clubDetail.memberCount.max,
      });
    }
    setIsEditingClubInfo(false);
  };

  const handleClubInfoChange = (field: string, value: string | number) => {
    setEditedClubInfo((prev) => ({
      ...prev,
      [field]: field === "maxMembers" ? Number(value) : value,
    }));
  };

  if (loading) {
    return <div className="text-center">載入中...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!clubDetail) {
    return <div className="alert alert-warning">找不到社團資訊</div>;
  }

  const userRole = clubDetail.currentUserRole;
  const canManage = hasManagementPermission(userRole);
  const canApprove = hasApprovalPermission(userRole);
  const isPresident = hasPresidentPermission(userRole);

  const currentMemberCount = calculateCurrentMemberCount(clubDetail.members);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-start m-0">社團資訊</h2>
        <Link to="/" className="btn btn-outline-secondary">
          返回社團列表
        </Link>
      </div>

      {/* 權限狀態指示 */}
      {userRole && (
        <div className="alert alert-info mb-4">
          <small>目前身份：{userRole}</small>
        </div>
      )}

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
                        handleClubInfoChange("name", e.target.value)
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
                        handleClubInfoChange("description", e.target.value)
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
                      value={editedClubInfo.maxMembers}
                      onChange={(e) =>
                        handleClubInfoChange("maxMembers", e.target.value)
                      }
                    />
                    <div className="form-text">
                      目前有效社員人數：{currentMemberCount} 人
                    </div>
                  </div>
                  <p className="mb-2 text-start">
                    創立日期：
                    {DataFormatter.formatDate(clubDetail.foundationDate)}
                  </p>
                  <p className="mb-0 text-start">
                    社團狀態：
                    {DataFormatter.formatClubStatus(clubDetail.status)}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="mb-3 text-start">{clubDetail.name}</h3>
                  <p className="mb-2 text-start">{clubDetail.description}</p>
                  <p className="mb-2 text-start">
                    創立日期：
                    {DataFormatter.formatDate(clubDetail.foundationDate)}
                  </p>
                  <p className="mb-2 text-start">
                    社團人數：{currentMemberCount}/{clubDetail.memberCount.max}
                  </p>
                  <p className="mb-0 text-start">
                    社團狀態：
                    {DataFormatter.formatClubStatus(clubDetail.status)}
                  </p>
                </div>
              )}
            </div>
            {isPresident && (
              <div className="flex-shrink-0 ms-3">
                {isEditingClubInfo ? (
                  <div>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={handleSaveClubInfo}
                    >
                      儲存
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleCancelEditClubInfo}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleEditClubInfo}
                  >
                    修改
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 成員表格 */}
      <div className="table-responsive mb-4">
        <table className="table table-striped text-start">
          <thead>
            <tr>
              <th className="text-start">成員名稱</th>
              <th className="text-start">職位</th>
              <th className="text-start">聯絡電話</th>
              <th className="text-start">電郵</th>
              <th className="text-start">狀態</th>
              <th className="text-start">加入日期</th>
              {canManage && <th className="text-start">操作</th>}
            </tr>
          </thead>
          <tbody>
            {clubDetail.members.map((member) => (
              <tr key={member.id}>
                <td className="text-start">{member.name}</td>
                <td className="text-start">
                  {editingMemberId === member.id ? (
                    <select
                      className="form-select form-select-sm"
                      value={editingMemberPosition}
                      onChange={(e) => setEditingMemberPosition(e.target.value)}
                      aria-label="選擇成員職位"
                    >
                      {availablePositions.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  ) : (
                    member.position
                  )}
                </td>
                <td className="text-start">{member.phone}</td>
                <td className="text-start">{member.email}</td>
                <td className="text-start">
                  <span
                    className={`badge ${
                      member.status === "active"
                        ? "bg-success"
                        : member.status === "pending"
                        ? "bg-warning"
                        : member.status === "inactive"
                        ? "bg-secondary"
                        : "bg-danger"
                    }`}
                  >
                    {DataFormatter.formatMemberStatus(member.status)}
                  </span>
                </td>
                <td className="text-start">
                  {DataFormatter.formatDate(member.joinDate)}
                </td>
                {canManage && (
                  <td className="text-start">
                    {editingMemberId === member.id ? (
                      // 編輯模式：顯示儲存和取消按鈕
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() =>
                            handleSaveMemberPosition(member.id, member.name)
                          }
                        >
                          儲存
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancelEditMember}
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      // 一般模式：顯示操作按鈕
                      <>
                        {member.status === "active" ? (
                          <>
                            {isPresident && (
                              <>
                                <button
                                  className="btn btn-primary btn-sm me-2"
                                  onClick={() =>
                                    handleStartEditMember(
                                      member.id,
                                      member.position
                                    )
                                  }
                                >
                                  變更
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() =>
                                    handleMemberStatusChange(
                                      member.id,
                                      member.name,
                                      "left"
                                    )
                                  }
                                >
                                  終止
                                </button>
                              </>
                            )}
                          </>
                        ) : member.status === "pending" ? (
                          <>
                            {canApprove && (
                              <>
                                <button
                                  className="btn btn-success btn-sm me-2"
                                  onClick={() =>
                                    handleMemberStatusChange(
                                      member.id,
                                      member.name,
                                      "active"
                                    )
                                  }
                                >
                                  批准
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() =>
                                    handleMemberStatusChange(
                                      member.id,
                                      member.name,
                                      "left"
                                    )
                                  }
                                >
                                  拒絕
                                </button>
                              </>
                            )}
                          </>
                        ) : null}
                        {!isPresident && member.status === "active" && (
                          <span className="text-muted">-</span>
                        )}
                        {!canApprove && member.status === "pending" && (
                          <span className="text-muted">-</span>
                        )}
                      </>
                    )}
                  </td>
                )}
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
              <th className="text-start">項目</th>
              <th className="text-start">日期</th>
              <th className="text-start">費用</th>
              <th className="text-start">狀態</th>
              {isPresident && (
                <th className="text-start">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAddActivity}
                  >
                    新增
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {clubDetail.activities.map((activity) => (
              <tr key={activity.id}>
                <td className="text-start">{activity.name}</td>
                <td className="text-start">
                  {DataFormatter.formatDateRange(activity.period)}
                </td>
                <td className="text-start">
                  {DataFormatter.formatCurrency(activity.fee)}
                </td>
                <td className="text-start">
                  <span
                    className={`badge ${
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
                </td>
                {canManage ? (
                  <td className="text-start">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEditActivity(activity.id)}
                    >
                      查看
                    </button>
                  </td>
                ) : (
                  <td className="text-start">
                    <span className="text-muted">-</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!userRole && (
        <div className="text-center mt-4">
          <button className="btn btn-success btn-lg">申請加入社團</button>
        </div>
      )}
    </div>
  );
};

export default ClubDetail;
