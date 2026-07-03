import ProductCard from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import React from 'react'

const page = () => {
  return (
    <section className="p-5 flex flex-col gap-5">
      <div className='flex justify-between items-center'>
      <h2 className="text-2xl font-bold text-foreground">Our Products</h2>
      <Button className='px-2'>Add New</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 mt-4">
        
          <ProductCard  category="Solar Panel" quantity={100} unit="units" status="In Stock" note="High efficiency solar panel"/>
            <ProductCard  category="Battery" quantity={50} unit="units" status="Low Stock" note="High capacity battery"/>
              <ProductCard  category="Inverter" quantity={25} unit="units" status="Out of Stock" note="High power inverter"/>
                <ProductCard  category="Mounting" quantity={75} unit="units" status="In Stock" note="Durable mounting kit"/>

      </div>
    </section>
  )
}

export default page