import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";

const Revenue = ({ token }) => {

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalImportCost: 0,
        profit: 0,
        totalOrders: 0
    });

    const fetchRevenueStats = async () => {
        try {

            let url = `${backendUrl}/api/order/revenue-stats`;

            const params = new URLSearchParams();

            if (fromDate) {
                params.append("fromDate", fromDate);
            }

            if (toDate) {
                params.append("toDate", toDate);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setStats({
                    totalRevenue: response.data.totalRevenue || 0,
                    totalImportCost: response.data.totalImportCost || 0,
                    profit: response.data.profit || 0,
                    totalOrders: response.data.totalOrders || 0
                });
            }

        } catch (error) {
            console.error(
                "Lỗi khi lấy thống kê doanh thu:",
                error
            );
        }
    };

    useEffect(() => {
        if (token) {
            fetchRevenueStats();
        }
    }, [token, fromDate, toDate]);


    return (
        <div className="p-6 bg-white shadow-md rounded-lg">

            <h3 className="text-2xl font-bold mb-6">
                📊 Thống kê doanh thu
            </h3>

            {/* BỘ LỌC NGÀY */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <h4 className="text-lg font-bold text-gray-800 mb-4">
                    🔎 Lọc doanh thu theo ngày
                </h4>

                <div className="flex flex-wrap items-end gap-4">

                    <div>
                        <label className="mb-2 block font-semibold">
                            Từ ngày
                        </label>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) =>
                                setFromDate(e.target.value)
                            }
                            className="rounded-lg border px-4 py-2.5"
                        />
                    </div>


                    <div>
                        <label className="mb-2 block font-semibold">
                            Đến ngày
                        </label>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) =>
                                setToDate(e.target.value)
                            }
                            className="rounded-lg border px-4 py-2.5"
                        />
                    </div>


                    <button
                        type="button"
                        onClick={() => {
                            setFromDate("");
                            setToDate("");
                        }}
                        className="rounded-lg bg-gray-600 px-5 py-2.5 text-white"
                    >
                        Xóa bộ lọc
                    </button>

                </div>

                <p className="mt-4 text-gray-600">
                    Hiển thị{" "}
                    <span className="font-bold text-blue-600">
                        {stats.totalOrders}
                    </span>{" "}
                    đơn hàng thành công
                </p>

            </div>


            {/* THỐNG KÊ */}
            <div className="space-y-4">

                <div className="bg-blue-50 p-5 rounded-lg">
                    <p className="text-sm text-gray-500">
                        Tổng doanh thu
                    </p>

                    <p className="text-2xl font-bold text-blue-600">
                        {stats.totalRevenue.toLocaleString()} {currency}
                    </p>
                </div>


                <div className="bg-red-50 p-5 rounded-lg">
                    <p className="text-sm text-gray-500">
                        Tổng giá vốn
                    </p>

                    <p className="text-2xl font-bold text-red-600">
                        {stats.totalImportCost.toLocaleString()} {currency}
                    </p>
                </div>


                <div className="bg-green-50 p-5 rounded-lg">
                    <p className="text-sm text-gray-500">
                        Lợi nhuận
                    </p>

                    <p className="text-2xl font-bold text-green-600">
                        {stats.profit.toLocaleString()} {currency}
                    </p>
                </div>

            </div>

        </div>
    );
};

export default Revenue;