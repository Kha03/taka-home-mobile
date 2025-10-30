import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
function parseDateString(dateStr: string): Date {
  // Kiểm tra xem có phải định dạng dd/mm/yyyy không
  const dmyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(dmyRegex);

  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);

    return new Date(year, month, day);
  } else {
    return new Date(dateStr);
  }
}

/**
 * Kiểm tra xem thanh toán có bị quá hạn hay không.
 */
export function isPaymentOverdue(
  dueDates: string,
  status: "PAID" | "PENDING" | "OVERDUE"
): boolean {
  if (status === "PAID") {
    return false; // Đã trả tiền thì không quá hạn
  }
  if (status === "OVERDUE") {
    return true; // Đã bị đánh dấu là quá hạn
  }
  // 2. Nếu trạng thái là "PENDING", chúng ta cần kiểm tra ngày
  const dueDate = parseDateString(dueDates);
  // 3. Kiểm tra xem ngày có hợp lệ không (phòng trường hợp chuỗi rác)
  if (isNaN(dueDate.getTime())) {
    console.error("Chuỗi ngày không hợp lệ:", dueDates);
    return false;
  }
  // 4. So sánh với ngày hôm nay
  const now = new Date();
  // Lấy 00:00:00 của ngày hôm nay
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return dueDate < today;
}
