import React from 'react'
import DashboardCards from '../../../Components/DashboardCards'

function HomeScreen() {
  return (
    <>
      <div className="title">
        <div className='flex spc-btw title-bar'>
          <h1>Home</h1>
        </div>
        <hr/>
      </div>
      <div className="container flex flex-dv spc-arnd">
        <div className="flex spc-arnd flex-grow-1">
          <DashboardCards title='Transactions'/>
          <DashboardCards title='Validations'/>
        </div>
        <div className="flex spc-arnd flex-grow-1">
          <DashboardCards title='Projects'/>
        </div>
      </div>
    </>
  )
}

export default HomeScreen