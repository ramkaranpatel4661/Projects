import React from 'react'
import AppHeader from '../_components/AppHeader';
import FeaturAssistant from './_components/FeaturAssistant';
import History from './_components/History';
import Feedback from './_components/Feedback';
function Dashboard(){
  return (
    <div>
       <FeaturAssistant></FeaturAssistant>
       <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-10'>
        <History></History>
        <Feedback></Feedback>
       </div>
    </div>
  )
}

export default Dashboard;
