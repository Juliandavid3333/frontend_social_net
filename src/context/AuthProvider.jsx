import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Global } from "../helpers/Global";
import { AuthContext } from "./AuthContext";

// Definir el componente proveedor de contexto AuthProvider
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [counters, setCounters] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authUser();
  }, []);

  const authUser = async () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      setLoading(false);
      return false;
    }

    try {
      // Asegurarse de que el token tenga el prefijo "Bearer "
      const authHeader = `Bearer ${token}`;

      // Transformar los datos a un objeto de javascript
      const userObj = JSON.parse(user);
      const userId = userObj.id;

      // Verificar la URL que se va a usar en la solicitud
      const userProfileUrl = `${Global.url}user/profile/${userId}`;
      console.log("URL de perfil del usuario:", userProfileUrl); // Verificar la URL

      // Petición Ajax al backend para comprobar el token y obtener los datos del usuario
      const request = await fetch(userProfileUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader, // Usar el token con el prefijo "Bearer "
        },
      });

      if (!request.ok) {
        throw new Error(`Error ${request.status}: ${request.statusText}`);
      }

      const data = await request.json();

      setAuth(data.user);
      setLoading(false);

      // Solicitar los contadores del usuario
      const requestCounters = await fetch(`${Global.url}user/counters/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
      });

      if (!requestCounters.ok) {
        throw new Error(`Error ${requestCounters.status}: ${requestCounters.statusText}`);
      }

      const dataCounters = await requestCounters.json();
      setCounters(dataCounters);

    } catch (error) {
      console.error("Error en autenticación:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, counters, setCounters, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};




