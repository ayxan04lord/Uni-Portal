import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Topbar from '../Topbar/Topbar'
import './Layout.css'

const Layout = () => (
  <div className="layout">
    <Sidebar />
    <div className="layout__main">
      <Topbar />
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  </div>
)

export default Layout
