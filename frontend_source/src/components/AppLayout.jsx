import TopNav from './TopNav';
import SideNav from './SideNav';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a1628] text-white">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        <main className="flex-1 overflow-auto p-5 bg-[#0a1628]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
