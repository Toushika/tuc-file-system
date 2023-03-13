import React, { useEffect, useContext } from 'react';
import logo from '../../images/logo.png';
import avatar from '../../images/avatar.png'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function SideBar() {
    useEffect(() => {
        const trees = window.$('[data-widget="treeview"]');
        trees.Treeview('init');
    }, []);
    const location = useLocation();
    const nav = useNavigate();
    const auth = useContext(AuthContext);
    const roleId = auth.roleId;
    console.log(auth.token);
    const logoutHandler = (e) => {
        e.preventDefault();
        auth.logout();
        nav("/");
    }
    return (

        <aside className="main-sidebar sidebar-dark-primary elevation-4">
            {/* Brand Logo */}
            <Link to='/' className="brand-link">

                <img src={logo} className="brand-image elevation-3" />
                <span className="brand-text font-weight-light">TUC File Manager</span>
            </Link>
            {/* Sidebar */}
            <div className="sidebar">
                {/* Sidebar user panel (optional) */}
                <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div className="image">
                        <img src={avatar} className="img-circle elevation-3" alt="User Image" />
                    </div>
                    <div className="info">
                        <a href="#" className="d-block">{roleId === 1 ? "Admin" : "User"}</a>
                    </div>
                </div>

                {/* Sidebar Menu */}
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                        {/* Add icons to the links using the .nav-icon class
         with font-awesome or any other icon font library */}
                        <li className="nav-item">
                            <a href="/" className="nav-link">
                                <i className="nav-icon fas fa-th" />

                                <p>
                                    Dashboard
                                </p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="/#" className="nav-link">
                                <i className="nav-icon fas fa-copy" />
                                <p>
                                    Files
                                    <i className="fas fa-angle-left right" />

                                </p>
                            </a>
                            <ul className="nav nav-treeview">

                                {auth.token &&
                                    <li className="nav-item">
                                        <NavLink to='/upload-files' className="nav-link">
                                            <i className="nav-icon fas fa-upload" />
                                            <p>Upload File</p>
                                        </NavLink>
                                    </li>
                                }
                                {auth.token &&
                                    <li className="nav-item">
                                        <NavLink to='/view-files' className="nav-link">
                                            <i className="fas fa-file nav-icon" />
                                            <p>View Files</p>
                                        </NavLink>
                                    </li>
                                }

                                

                            </ul>
                        </li>
                        {auth.token && roleId === 2 &&
                            <li className="nav-item">
                                <a href="#" className="nav-link">
                                    <i className="nav-icon fas fa-user" />
                                    <p>
                                        User
                                        <i className="right fas fa-angle-left" />
                                    </p>
                                </a>
                                <ul className="nav nav-treeview">
                                    <li className="nav-item">
                                        <NavLink to='/view-my-files' className="nav-link">
                                            <i className="far fa-edit nav-icon" />
                                            <p>Edit File</p>
                                        </NavLink>
                                    </li>

                                </ul>
                            </li>
                        }
                        {auth.token && roleId === 1 &&
                            <li className="nav-item">
                                <a href="#" className="nav-link">
                                    <i className="nav-icon fas fa-user-secret" />
                                    <p>
                                        Admin
                                        <i className="fas fa-angle-left right" />
                                    </p>
                                </a>
                                <ul className="nav nav-treeview">
                                    <li className="nav-item">
                                        <NavLink to='/view-requests' className="nav-link">
                                            <i className="far fa-circle nav-icon" />
                                            <p>Pending Request</p>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to='/view-my-files' className="nav-link">
                                            <i className="far fa-edit nav-icon" />
                                            <p>Edit File</p>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        }
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-lock" />
                                <p>
                                    Authentication
                                    <i className="fas fa-angle-left right" />
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                {!auth.token &&
                                    <li className="nav-item">
                                        <NavLink to='/auth' className="nav-link">
                                            <i className="fas fa-key nav-icon" />

                                            <p>Login</p>
                                        </NavLink>
                                    </li>
                                }
                                {auth.token &&
                                    <li className="nav-item">
                                        <a href='#' className="nav-link" onClick={logoutHandler}>
                                            <i className="fas fa-door-open nav-icon" />

                                            <p >Logout</p>
                                        </a>
                                    </li>
                                }
                                {!auth.token &&
                                    <li className="nav-item">
                                        <NavLink to='/signup' className="nav-link">
                                            <i className=" far fa-id-card nav-icon" />
                                            <p>SignUp</p>
                                        </NavLink>
                                    </li>
                                }



                            </ul>
                        </li>
                    </ul>
                </nav>
                {/* /.sidebar-menu */}
            </div>
            {/* /.sidebar */}
        </aside>


    )
}

export default SideBar;