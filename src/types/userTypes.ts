export interface UserType {
  id: string;
  email: string;
  password: string;
  name?: string;
  age?: number;
  address?: string;
  phone?: string;
  role: "admin" | "user";
  avatar?: string;
  isActive?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  totalCost: string;
}

export interface Order {
  id: string;
  cartItems: string[];
  totalCost: string;
}
