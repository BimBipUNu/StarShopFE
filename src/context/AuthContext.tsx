import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import type { UserType } from "../types/userTypes";
import Api from "../api";

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResponse>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = (): void => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          const parsedUser: UserType = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      // Dựa trên log bạn đưa: response chính là { success: true, data: {...} }
      const response = await Api.auth.login({ email, password });

      console.log("AuthContext Response:", response); // Debug xem log

      // Kiểm tra dựa trên log
      if (response && response.data) {
        //  Token nằm trong response.data.token
        const { token, user } = response.data;

        if (token) {
          localStorage.setItem("token", token);
          setUser(user.user);
          return { success: true, message: "Thành công" };
        }
      }

      return {
        success: false,
        message: "Cấu trúc phản hồi không hợp lệ",
      };
    } catch (error) {
      console.error("Login Context Error:", error);
      return {
        success: false,
        message: "Đăng nhập thất bại",
      };
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const credentials: RegisterCredentials = { name, email, password };
      await Api.auth.register(credentials);

      return { success: true };
    } catch (error) {
      console.error("Register error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Đăng ký thất bại";

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
