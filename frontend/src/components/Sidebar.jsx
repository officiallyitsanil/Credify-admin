import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, FileText, CreditCard, UserCircle, LogOut, Menu, X,
    ShieldCheck, TrendingUp, Banknote, DollarSign, Bell, PhoneCall, AlertTriangle,
    LifeBuoy, BookOpen, Settings
} from 'lucide-react';
import { logout } from '../utils/auth';
import ProfileModal from './ProfileModal';
import './Sidebar.css';

const Sidebar = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/kyc', icon: ShieldCheck, label: 'KYC Management' },
        { path: '/credit-limit', icon: TrendingUp, label: 'Credit Limits' },
        { path: '/loans', icon: FileText, label: 'Loans' },
        { path: '/disbursement', icon: Banknote, label: 'Disbursements' },
        { path: '/repayments', icon: CreditCard, label: 'Repayments' },
        { path: '/interest-fees', icon: DollarSign, label: 'Interest & Fees' },
        { path: '/notifications', icon: Bell, label: 'Notifications' },
        { path: '/collections', icon: PhoneCall, label: 'Collections' },
        { path: '/risk-management', icon: AlertTriangle, label: 'Risk & Fraud' },
        { path: '/support', icon: LifeBuoy, label: 'Support' },
        { path: '/cms', icon: BookOpen, label: 'CMS' },
        { path: '/settings', icon: Settings, label: 'Settings' }
    ];
    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && !event.target.closest('.sidebar')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    const handleNavClick = () => {
        setIsMobileMenuOpen(false);
    };

    const handleProfileClick = () => {
        setIsProfileOpen(true);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        setIsMobileMenuOpen(false);
        logout();
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/logo.jpeg" alt="Credify" className="sidebar-logo-img" />
                </div>
                <div className="sidebar-subtitle">Admin Panel</div>
            </div>

            {/* Hamburger Menu Button (Mobile Only) */}
            <button
                className="hamburger-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
                <nav className="mobile-menu-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                `mobile-menu-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    <div className="mobile-menu-divider"></div>

                    <button onClick={handleProfileClick} className="mobile-menu-item">
                        <UserCircle size={20} />
                        <span>Profile</span>
                    </button>

                    <button onClick={handleLogout} className="mobile-menu-item mobile-menu-logout">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </div>

            {/* Desktop Navigation */}
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

            {/* Desktop Footer */}
            <div className="sidebar-footer">
                <button onClick={() => setIsProfileOpen(true)} className="sidebar-profile-btn">
                    <UserCircle size={20} />
                    <span>Profile</span>
                </button>
                <button onClick={logout} className="sidebar-logout">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onUpdate={() => window.location.reload()}
            />
        </div >
    );
};

export default Sidebar;
