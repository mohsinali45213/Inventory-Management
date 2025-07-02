import React, { useState } from "react";
import { Plus, ChevronDown, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../context/ModalContext";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { setTriggerAddModal } = useModal();

  return (
    <header className="header" style={{background:'linear-gradient(135deg, #1e40af 60%, #1e3a8a 100%)', color:'#fff', borderRadius:'18px', boxShadow:'0 4px 24px rgba(30,64,175,0.10)', padding:'1.2rem 2rem', margin:'0.7rem 0.7rem 0 0.7rem', height:'64px', minHeight:'64px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
      <div className="header-content" style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%'}}>
        <div className="header-left">
          <div className="logo">
            <h1 style={{color:'#fff'}}>ClothingInv</h1>
          </div>
        </div>

        <div className="header-right" style={{display:'flex', alignItems:'center', gap:'1.5em'}}>
          <div className="quick-add-dropdown" style={{display:'flex', alignItems:'center'}}>
            <button
              className="quick-add-btn"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              style={{color:'#fff', display:'flex', alignItems:'center', gap:'.5em', padding:'0.8em 1em', borderRadius:'10px', background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', fontWeight:500}}>
              <Plus size={16} />
              <span>Quick Add</span>
              <ChevronDown size={16} />
            </button>

            {showQuickAdd && (
              <div className="dropdown-menu">
                <Link to="/products">
                  <button className="dropdown-item" onClick={() => {
                    setTriggerAddModal(true);
                  }}>
                    <Plus size={16} />
                    Add Product
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="user-menu" style={{display:'flex', alignItems:'center'}}>
            <button
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{color:'#fff', display:'flex', alignItems:'center', gap:'.5em', padding:'0.8em 1em', borderRadius:'10px', background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', fontWeight:500}}>
              <User size={20} />
              <span>{user?.name}</span>
              <ChevronDown size={16} />
            </button>

            {showUserMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item dropdown-item-info">
                  <div className="user-info">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-phone">{user?.phone}</div>
                  </div>
                </div>
                <hr />
                <button className="dropdown-item" onClick={logout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
