import axiosConfig from "./axiosConfig";

export async function getRevenue() {
  try {
    const response = await axiosConfig.get(`/stats/revenue`);
    return response;
  } catch (err) {
    console.log(err);
  }
}

export async function getMonthlyRevenue() {
  try {
    const response = await axiosConfig.get(`/stats/revenue/monthly`);
    return response;
  } catch (err) {
    console.log(err);
  }
}

export async function getTopSellingProducts(limit: number = 5) {
  try {
    const response = await axiosConfig.get(
      `/stats/products/top-selling?limit=${limit}`
    );
    return response.data;
  } catch (err) {
    console.log(err);
  }
}

const statsAPI = {
  revenue: getRevenue,
  monthlyRevenue: getMonthlyRevenue,
  topSelling: getTopSellingProducts,
};

export default statsAPI;
