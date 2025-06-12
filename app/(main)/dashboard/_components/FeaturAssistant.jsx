"use client";
import React from 'react';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ExpertList } from '@/services/Options';
import UserInputDialog from './UserInputDialog';

function FeaturAssistant() {
  const user = useUser();

  return (
    <div>
      <div className='flex justify-between'>
        <div>
          <h2 className='font-medium text-white'>My workspace</h2>
          <h2 className='text-3xl font-bold'>Welcome back, {user?.displayName}</h2>
        </div>
        <Button>Profile</Button>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-10 mt-10'>
        {ExpertList.map((option, index) => (
           <div
            key={index}
            className='p-5 bg-secondary rounded-3xl flex flex-col justify-center items-center text-black
                       hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer'
          >
          <UserInputDialog ExpertList={option}> 
          <div
            key={index}
            className='flex flex-col justify-center items-center'>
          
            <Image
              src={option.icon}
              alt={option.name}
              width={100}
              height={100}
              className='h-[70px] w-[70px] transition-all duration-300 ease-in-out hover:rotate-12 hover:scale-110'
            />
            <h2 className='mt-3 text-sm font-semibold text-center'>{option.name}</h2>
          </div>
          </UserInputDialog>
          </div>
        ))}
      </div>
    </div>
    
  );
}

export default FeaturAssistant;
