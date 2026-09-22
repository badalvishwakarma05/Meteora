import TopNav from './TopNav';
import SideNav from './SideNav';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen md:h-screen overflow-x-hidden md:overflow-hidden bg-[#0a1628] text-white w-full">
      <TopNav />
      <div className="flex flex-col md:flex-row flex-1 overflow-x-hidden md:overflow-hidden w-full">
        <SideNav />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-5 bg-[#0a1628] min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
