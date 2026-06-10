import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="h-screen bg-slate-100">

      {/* <Navbar /> */}



        {/* <Sidebar /> */}

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>



    </div>
  );
};

export default MainLayout;