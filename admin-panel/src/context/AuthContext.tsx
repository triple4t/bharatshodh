import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

interface Admin {
  id: string;
  _id?: string; // Backend may return _id instead of id
  username: string;
  email: string;
  is_super_admin: boolean;
  created_at: string;
}

// Normalize admin data - convert _id to id if needed
function normalizeAdmin(adminData: any): Admin {
  if (!adminData) {
    throw new Error("Admin data is null or undefined");
  }
  
  // Handle both _id and id fields
  const id = adminData.id || adminData._id;
  
  if (!id) {
    console.warn("No id or _id found in admin data:", adminData);
  }
  
  return {
    ...adminData,
    id: id || "",
  };
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    const storedAdmin = localStorage.getItem("admin_user");

    if (storedToken && storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        const normalizedAdmin = normalizeAdmin(adminData);
        setToken(storedToken);
        setAdmin(normalizedAdmin);
      } catch (e) {
        console.error("Error parsing stored admin data:", e);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { adminApi } = await import("./../services/api");
      const response = await adminApi.login(username, password);
      
      // Validate response structure
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      const responseData = response.data;
      const access_token = responseData.access_token;
      const adminData = responseData.admin;
      
      // Validate required fields
      if (!access_token) {
        throw new Error("Access token not found in response");
      }
      
      if (!adminData) {
        throw new Error("Admin data not found in response");
      }

      // Normalize admin data - convert _id to id if needed
      const normalizedAdmin = normalizeAdmin(adminData);
      
      // Validate normalized admin has required fields
      if (!normalizedAdmin.id && !normalizedAdmin._id) {
        throw new Error("Admin ID not found in response");
      }

      setToken(access_token);
      setAdmin(normalizedAdmin);

      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_user", JSON.stringify(normalizedAdmin));
    } catch (error: any) {
      console.error("Login error:", error);
      // Provide better error message
      const errorMessage = error?.response?.data?.detail || error?.message || "Login failed. Please try again.";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
