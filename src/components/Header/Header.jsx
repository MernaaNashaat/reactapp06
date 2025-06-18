import React from 'react';
import { LogOut, User, Shield } from 'lucide-react';
import './Header.css';

const Header = ({ user, signOut }) => {
    return (
        <header className="header">
            <div className="header-container">
                {/* Left side: App icon + name */}
                <div className="header-left">
                    {/* <div className="logo-icon"> */}
                    <img src="https://bucketgp.s3.eu-north-1.amazonaws.com/pics_for_GP/WhatsApp_Image_2024-08-20_at_1.09.28_AM-removebg-preview.png" alt="Logo" className="logo-img" />
                    {/* </div> */}
                    <h1 className="app-title">SmartBatch</h1>
                </div>

                {/* Right side: User + Logout */}
                <div className="header-right">
                    <div className="user-info">
                        <User className="icon" />
                        <span>{user?.username || 'User'}</span>
                    </div>

                    <div className="divider" />

                    <button className="signout-button" onClick={signOut}>
                        <LogOut className="icon" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;