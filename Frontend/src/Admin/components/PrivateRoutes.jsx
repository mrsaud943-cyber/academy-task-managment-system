import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../service/api";

const PrivateRoutes = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === "admin"
    ? <Outlet />
    : <Navigate to="/layout/desboards" replace />;
};

export default PrivateRoutes;