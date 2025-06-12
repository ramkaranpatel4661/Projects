import React from 'react';
import Image from 'next/image';
import { UserButton } from '@stackframe/stack';

function AppHeader() {
  return (
    <div className="relative p-3">
      <Image 
        src="/logo.png" 
        alt="logo"
        width={100}
        height={100}
      />
      <div className="absolute top-3 right-3">
        <UserButton />
      </div>
    </div>
  );
}

export default AppHeader;
