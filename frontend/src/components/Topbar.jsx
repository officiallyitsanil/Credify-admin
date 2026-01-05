import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { getAdmin } from '../utils/auth';
import { getInitials } from '../utils/helpers';
import './Topbar.css';

const Topbar = ({ title }) => {
    const admin = getAdmin();

    return (
        <div className="topbar">
            <div className="topbar-left">
                <h2 className="topbar-title">{title}</h2>
            </div>

            <div className="topbar-right">
                <div className="topbar-search">
                    <Search size={18} />
                    <input type="text" placeholder="Search..." />
                </div>

                <button className="topbar-icon-btn">
                    <Bell size={20} />
                </button>

                <button className="topbar-icon-btn">
                    <Settings size={20} />
                </button>

                <div className="topbar-profile">
                    <div className="topbar-avatar">
                        {getInitials(admin?.name)}
                    </div>
                    <div className="topbar-profile-info">
                        <div className="topbar-profile-name">{admin?.name}</div>
                        <div className="topbar-profile-role">{admin?.role}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
