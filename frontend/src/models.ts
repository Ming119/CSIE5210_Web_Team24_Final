export interface Club {
  id: number;
  name: string;
  description: string;
  presidentName?: string;
  memberCount?: {
    current: number;
    max: number;
  };
  userRole?: string; // 用戶在社團中的身份: 社長, 幹部, 社員, 準社員, 前社員等
  status?: "active" | "pending" | "rejected" | "suspended" | "disbanded"; // 社團狀態
  foundationDate?: Date;
  image?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface Activity {
  id: number;
  name: string;
  description: string;
  period: DateRange;
  paymentPeriod: DateRange;
  fee: number;
  status: "planning" | "open" | "closed" | "completed" | "cancelled";
  paymentMethods: {
    cash: boolean;
    bankTransfer: boolean;
  };
  bankInfo?: {
    bank: string;
    accountNumber: string;
    accountName: string;
  };
  cashInfo?: {
    schedule: string;
    location: string;
  };
}

export interface Member {
  id: number;
  name: string;
  position: string;
  phone: string;
  email: string;
  status: "active" | "pending" | "inactive" | "left";
  joinDate: Date;
  lastActiveDate?: Date;
}

// 格式化工具函數
export class DataFormatter {
  static formatCurrency(amount: number): string {
    if (amount === 0) return "免費";
    return `$${amount.toLocaleString()}`;
  }

  // 格式化成員數量
  static formatMemberCount(memberCount: {
    current: number;
    max: number;
  }): string {
    return `${memberCount.current}/${memberCount.max}`;
  }

  // 格式化日期範圍
  static formatDateRange(dateRange: DateRange): string {
    const startStr = dateRange.startDate.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const endStr = dateRange.endDate.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${startStr} 至 ${endStr}`;
  }

  // 格式化單一日期
  static formatDate(date: string | Date): string {
    // 若是字串，轉成 Date 物件
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // 格式化狀態顯示
  static formatClubStatus(status: Club["status"]): string {
    switch (status) {
      case "active":
        return "已成立";
      case "pending":
        return "待審核";
      case "rejected":
        return "已拒絕";
      case "suspended":
        return "暫停營運";
      case "disbanded":
        return "已解散";
      default:
        return "未知";
    }
  }

  static formatMemberStatus(status: Member["status"]): string {
    switch (status) {
      case "active":
        return "有效";
      case "pending":
        return "待確認";
      case "inactive":
        return "暫停";
      case "left":
        return "已離開";
      default:
        return "未知";
    }
  }

  static formatActivityStatus(status: Activity["status"]): string {
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
        return "未知";
    }
  }
}

// 模擬數據生成器
export class MockDataGenerator {
  static generateClub(index: number): Club {
    const foundationDate = new Date(
      2020 + Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );

    return {
      id: index + 1,
      name: `社團${index + 1}`,
      description: `這是社團${index + 1}的描述...`,
      foundationDate,
      memberCount: {
        current: Math.floor(Math.random() * 50) + 10,
        max: Math.floor(Math.random() * 50) + 50,
      },
    };
  }

  static generateMyClub(index: number): Club {
    const statuses: Club["status"][] = ["active", "suspended"];
    const roles = ["社長", "幹部", "社員", "準社員", "前社員"];

    return {
      id: index + 1,
      name: `社團${index + 1}`,
      description: `社團${index + 1}描述`,
      presidentName: index === 4 ? "-" : `社長${index + 1}`,
      memberCount: {
        current: index === 4 ? 0 : Math.floor(Math.random() * 40) + 20,
        max: Math.floor(Math.random() * 50) + 50,
      },
      userRole: roles[index % roles.length],
      status: index === 4 ? "suspended" : "active",
      foundationDate: new Date(2020, index % 12, ((index * 5) % 28) + 1),
    };
  }

  static generateActivity(index: number): Activity {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() + index, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + index + 3, 0);

    const activities = [
      { name: "社費", fee: 1000 },
      { name: "春遊活動", fee: 2500 },
      { name: "免費講座", fee: 0 },
      { name: "待定活動", fee: 0 },
    ];

    const activity = activities[index % activities.length];

    return {
      id: index + 1,
      name: activity.name,
      description: "詳情...\n...\n...\n...\n...",
      period: { startDate, endDate },
      paymentPeriod: { startDate, endDate },
      fee: activity.fee,
      status: index < 2 ? "open" : index === 2 ? "completed" : "planning",
      paymentMethods: {
        cash: true,
        bankTransfer: true,
      },
      bankInfo: {
        bank: "700(中華郵政)",
        accountNumber: "0001236 06254481",
        accountName: "陳大文",
      },
      cashInfo: {
        schedule: "星期一—至五13:00-15:00",
        location: "社辦",
      },
    };
  }

  static generateMember(index: number): Member {
    const positions = ["社長", "副社長", "活動幹部", "社員", "準社員"];
    const statuses: Member["status"][] = [
      "active",
      "active",
      "active",
      "active",
      "pending",
    ];
    const joinDate = new Date(
      2024,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );

    return {
      id: index + 1,
      name: `${positions[index % positions.length]}${Math.floor(index / positions.length) + 1
        }`,
      position: positions[index % positions.length],
      phone: `091234567${index}`,
      email: `member${index + 1}@ntu.edu.tw`,
      status: statuses[index % statuses.length],
      joinDate,
      lastActiveDate: new Date(),
    };
  }
}

// 產生模擬資料
export const dummyClubs: Club[] = Array.from({ length: 20 }, (_, index) =>
  MockDataGenerator.generateClub(index)
);

export const myDummyClubs: Club[] = Array.from({ length: 5 }, (_, index) =>
  MockDataGenerator.generateMyClub(index)
);
