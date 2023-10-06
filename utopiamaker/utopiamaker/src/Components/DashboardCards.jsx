import React from 'react'
import PropTypes from 'prop-types'

function DashboardCards({title, children}) {
  return (
    <>
        <div className='dashboard-card flex flex-grow-1'>
            <div className='flex flex-dv'>
                <div>{title}</div>
                <hr/>
            </div>
            <div>
              {children}
            </div>
        </div>
    </>
  )
}

DashboardCards.propTypes = {
    title: PropTypes.string.isRequired,
}

export default DashboardCards
