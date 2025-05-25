import {
  type Activity,
  type Club,
  DataFormatter,
  type Member,
  MockDataGenerator,
} from "./models";

export interface ClubDetailData {
  id: number;
  name: string;
  description: string;
  foundationDate: Date;
  memberCount: {
    current: number;
    max: number;
  };
  status: Club["status"];
  members: Member[];
  activities: Activity[];
  currentUserRole?: string;
}

export const ClubService = {
  getAllClubs: async (): Promise<Club[]> => {
    try {
      // // 模擬 API 延遲
      // await new Promise((resolve) => setTimeout(resolve, 300));

      return Array.from({ length: 20 }, (_, index) =>
        MockDataGenerator.generateClub(index)
      );
    } catch (error) {
      console.error("獲取社團資料失敗", error);
      throw error;
    }
  },

  getMyClubs: async (): Promise<Club[]> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      return Array.from({ length: 5 }, (_, index) =>
        MockDataGenerator.generateMyClub(index)
      );
    } catch (error) {
      console.error("獲取我的社團資料失敗", error);
      throw error;
    }
  },

  createClub: async (clubData: Omit<Club, "id">): Promise<Club> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        id: Math.floor(Math.random() * 1000),
        foundationDate: new Date(),
        status: "active" as const,
        ...clubData,
      };
    } catch (error) {
      console.error("建立社團失敗", error);
      throw error;
    }
  },

  getClubDetail: async (clubId: number): Promise<ClubDetailData> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // 模擬獲取當前用戶角色
      const getCurrentUserRole = (): string => {
        if (clubId <= 2) return "社長";
        if (clubId <= 5) return "幹部";
        if (clubId <= 10) return "社員";
        return "";
      };

      // 生成成員資料
      const members: Member[] = Array.from({ length: 5 }, (_, index) =>
        MockDataGenerator.generateMember(index)
      );

      // 生成活動資料
      const activities: Activity[] = Array.from({ length: 4 }, (_, index) =>
        MockDataGenerator.generateActivity(index)
      );

      return {
        id: clubId,
        name: `社團${clubId}`,
        description: "描述...\n...\n...",
        foundationDate: new Date(2020, 3, 1), // 2020年4月1日
        memberCount: {
          current: 10,
          max: 50,
        },
        status: "active",
        currentUserRole: getCurrentUserRole(),
        members,
        activities,
      };
    } catch (error) {
      console.error("獲取社團詳情失敗", error);
      throw error;
    }
  },

  joinClub: async (
    clubId: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      return {
        success: true,
        message: "申請已送出，請等待社團管理員審核。",
      };
    } catch (error) {
      console.error("申請加入社團失敗", error);
      throw error;
    }
  },

  getActivity: async (
    clubId: number,
    activityId: number
  ): Promise<Activity> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (activityId <= 4) {
        return MockDataGenerator.generateActivity(activityId - 1);
      }

      // 空的新活動
      const now = new Date();
      return {
        id: 0,
        name: "",
        description: "",
        period: {
          startDate: now,
          endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30天後
        },
        paymentPeriod: {
          startDate: now,
          endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        fee: 0,
        status: "planning",
        paymentMethods: {
          cash: false,
          bankTransfer: false,
        },
      };
    } catch (error) {
      console.error("獲取活動資料失敗", error);
      throw error;
    }
  },

  saveActivity: async (
    clubId: number,
    activity: Activity
  ): Promise<Activity> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log(`儲存社團 ${clubId} 的活動:`, activity);

      return {
        ...activity,
        id: activity.id || Date.now(), // 如果是新活動，給個臨時 ID
      };
    } catch (error) {
      console.error("儲存活動失敗", error);
      throw error;
    }
  },

  // 成員管理 API
  updateMemberStatus: async (
    clubId: number,
    memberId: number,
    newStatus: Member["status"]
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      console.log(`更新社團 ${clubId} 成員 ${memberId} 狀態為 ${newStatus}`);

      return {
        success: true,
        message: "成員狀態更新成功",
      };
    } catch (error) {
      console.error("更新成員狀態失敗", error);
      throw error;
    }
  },

  // 社團資訊更新 API
  updateClubInfo: async (
    clubId: number,
    clubInfo: Partial<Pick<Club, "name" | "description" | "memberCount">>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      console.log(`更新社團 ${clubId} 資訊:`, clubInfo);

      return {
        success: true,
        message: "社團資訊更新成功",
      };
    } catch (error) {
      console.error("更新社團資訊失敗", error);
      throw error;
    }
  },

  updateMemberPosition: async (
    clubId: number,
    memberId: number,
    newPosition: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      console.log(`更新社團 ${clubId} 成員 ${memberId} 職位為 ${newPosition}`);

      return {
        success: true,
        message: "成員職位更新成功",
      };
    } catch (error) {
      console.error("更新成員職位失敗", error);
      throw error;
    }
  },
};

// 匯出格式化工具，供組件使用
export { DataFormatter };
