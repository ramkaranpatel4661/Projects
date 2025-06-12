"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api"; 
import { UserContext } from "./_context/UserContext";


function AuthProvider({ children }) {
  const user = useUser();
  const createUser = useMutation(api.users.CreateUser); 
  const [userData,setUserData]=useState();
  useEffect(() => {
    {
      console.log(user);
      user &&createNewUser();
    }
  }, [user]);

  const createNewUser = async () => {
    try {
      const result = await createUser({
        name: user?.displayName,
        email: user?.primaryEmail,
      });
      console.log("User created:", result);
      setUserData(result);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  
  }
 return (
    <div>
        <UserContext.Provider value={{userData,setUserData}}>
        {children}
        </UserContext.Provider>
    </div>
 );
}

export default AuthProvider;
