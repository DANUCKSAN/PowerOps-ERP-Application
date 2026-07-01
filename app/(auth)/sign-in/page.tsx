import SignInForm from '@/components/SignInForm'
import React from 'react'

const page = () => {
  return (
    <div className="flex flex-col">
      <div className="bg-background">
        <h2 className="text-red-600">Sign In</h2>
        <p className="text-red-900">Access your account</p>
      </div>

      <div className="auth-card-body">
        <SignInForm />
      </div>
    </div>
  )
}
 

  


export default page
