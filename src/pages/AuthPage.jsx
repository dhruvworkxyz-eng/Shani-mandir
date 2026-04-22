import React from "react";
import { Navigate } from "react-router-dom";

const AuthPage = () => {
  return <Navigate to="/" replace state={{ openAuth: true }} />;
};

export default AuthPage;
