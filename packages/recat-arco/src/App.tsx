import { Routes, Route, BrowserRouter, Link } from "react-router-dom";
import React, { useMemo } from "react";
import { getFlattenRoutes, routes } from "./routes";

function App() {
  const flattenRoutes = useMemo(() => getFlattenRoutes(routes) || [], [routes]);
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          {/* 渲染菜单 */}
          <Link to="/">Home</Link>
          <Link to={"/dashboard"}>Dashboard</Link>
          <Link to={"/example"}>Example</Link>
        </nav>
        <Routes>
          {/* 渲染页面 */}
          {flattenRoutes.map((route) => {
            return (
              <Route
                key={route.key}
                path={`/${route.key}`}
                element={route.component}
              />
            );
          })}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
