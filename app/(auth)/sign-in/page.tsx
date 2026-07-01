import SignInForm from '@/components/SignInForm'
import React from 'react'

const page = () => {
  return (
    <div className="bg-background min-h-screen items-center">
      <h1>Welcome to PowerOps ERP!</h1>
      <p>Please sign in to continue.</p>
      <SignInForm/>
    </div>
  )
}
  
  


export default page
