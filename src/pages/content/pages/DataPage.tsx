import { PANEL_NAV_ITEMS } from "@src/pages/content/config";
import { NavLink, Outlet } from "react-router-dom";

export function DataPage() {
  return (
    <>
      <div className="flex">
        <div className="pill-group">
          {PANEL_NAV_ITEMS[0].children.map((item, i) => {
            return (
              <NavLink
                to={item.path}
                key={i}
                style={({ isActive }) => ({
                  backgroundColor: isActive
                    ? "hsl(var(--background))"
                    : "transparent",
                })}
                className="rounded-full pill"
              >
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </div>
      <Outlet />
    </>
  );
}
