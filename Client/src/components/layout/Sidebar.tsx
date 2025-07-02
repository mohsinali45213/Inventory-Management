import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Folder, 
  Tag, 
  BarChart3, 
  FileText, 
  Printer,
  TrendingUp,
  Folders,
  Users
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Folder, label: 'Categories', path: '/categories' },
    { icon: Folders, label: 'Sub Categories', path: '/sub-categories' },
    { icon: Tag, label: 'Brands', path: '/brands' },
    { icon: BarChart3, label: 'Stock Management', path: '/stock' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: Printer, label: 'Print Barcode', path: '/barcode' },
    { icon: TrendingUp, label: 'Reports', path: '/reports' },
    { icon: Users, label: 'Users', path: '/users' }
  ];

  return (
    <aside className="sidebar" style={{background:'linear-gradient(135deg, #1e40af 60%, #1e3a8a 100%)', color:'#fff', borderRadius:'18px', boxShadow:'0 4px 24px rgba(30,64,175,0.10)', padding:'1rem', minHeight:'90vh', margin:'1rem', display:'flex', flexDirection:'column', justifyContent:'flex-start'}}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item">
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                style={({ isActive }) => ({color:'#fff', background: isActive ? 'rgba(255,255,255,0.12)' : 'none', borderRadius:'12px', fontWeight: isActive ? 700 : 500, padding:'0.7em 1em', display:'flex', alignItems:'center', gap:'1em', transition:'background 0.2s'})}
              >
                <item.icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;