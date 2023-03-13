import { Fragment } from 'react';
import Footer from './Footer';


import Navigation from './Navigation';
import PageHeader from './PageHeader';
import SideBar from './SideBar';
import preloader from '../../images/preloader.gif';

const Layout = (props) => {

  return (
    <Fragment>
      <div className="preloader flex-column justify-content-center align-items-center">
        <img className="animation__shake" src={preloader} alt="TUC" height={260} width={260} />
      </div>
      <Navigation />

      {/* /.navbar */}
      {/* Main Sidebar Container */}
      <SideBar />
      {/* Content Wrapper. Contains page content */}
      <div className="content-wrapper">
      <PageHeader/>
        <main>{props.children}</main>
      </div>
      <Footer />
      <aside className="control-sidebar control-sidebar-dark">
      </aside>
    </Fragment>

  );
};

export default Layout;
