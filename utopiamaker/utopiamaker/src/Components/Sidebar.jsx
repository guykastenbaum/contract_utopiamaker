import React, {useContext, useState} from 'react'
import SidebarItem from './SidebarItem'
import { UserContext } from '../App';

function Sidebar() {

    const {user} = useContext(UserContext);
    const [sidebarOption, setSidebarOption] = useState(0);

    return (
        <div className="sidebar flex-dy">
            <div className="greeting">
                <div><h3>Hello,</h3><br/><h1>{user.name}</h1></div>
            </div>
            <ul>
                <SidebarItem isSelected={sidebarOption===0} onChange={() => setSidebarOption(0)} title='Home' to='./home'/>
                <SidebarItem isSelected={sidebarOption===1} onChange={() => setSidebarOption(1)} title='Projects' to='./projects/myprojects'/>
                <SidebarItem isSelected={sidebarOption===2} onChange={() => setSidebarOption(2)} title='Transactions' to='./transactions'/>
                <SidebarItem isSelected={sidebarOption===3} onChange={() => setSidebarOption(3)} title='Validations' to='./validations'/>
                <SidebarItem isSelected={sidebarOption===4} onChange={() => setSidebarOption(4)} title='My profile' to='./profile'/>
                <SidebarItem isSelected={sidebarOption===5} onChange={() => setSidebarOption(5)} title='Logout' to='../'/>
            </ul>
        </div>
    )
}

export default Sidebar