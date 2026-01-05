import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, CreditCard, LogOut } from 'lucide-react';
import { logout } from '../utils/auth';
import './Sidebar.css';

const Sidebar = () => {
    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/users', icon: Users, label: 'Users & KYC' },
        { path: '/loans', icon: FileText, label: 'Loan Requests' },
        { path: '/repayments', icon: CreditCard, label: 'Repayments' }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/logo.jpeg" alt="Credify" className="sidebar-logo-img" />
                </div>
                <div className="sidebar-subtitle">Admin Panel</div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) =>
                            `sidebar-nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={logout} className="sidebar-logout">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
