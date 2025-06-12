import React from 'react'
import AppHeader from './_components/AppHeader';

function DashboardLayout ({children}){
  return (
    <div className="min-h-screen bg-blue-600 text-white px-6 py-6">
      <AppHeader></AppHeader>
      <div className='p-10 mt-12 md:px-20 lg:px-32 xl:px-48 2xl:px-56'>
          {children}
      </div>
     
    </div>
  )
}

export default DashboardLayout;