import authAPI from "./auth";
import cartAPI from "./cart";
import categoryAPI from "./categories";
import orderAPI from "./order";
import productAPI from "./products";
import statsAPI from "./stats";
import userAPI from "./user";

const Api = {
  auth: authAPI,
  product: productAPI,
  category: categoryAPI,
  cart: cartAPI,
  stats: statsAPI,
  user: userAPI,
  order: orderAPI,
};

export default Api;
