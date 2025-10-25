import React from 'react'
import Hero from '../Components/FunelPage/Hero'
import Story from '../Components/FunelPage/Story'
import TeamSection from '../Components/FunelPage/Team'
import CrowdfundingSection from '../Components/FunelPage/Crowdfunding'
import TestimonialsSection from '../Components/FunelPage/Testimonial'
import FinalCTA from '../Components/FunelPage/finalCTA'

function Funnel() {
  return (
    <main>
      <Hero />
      <Story /> 
      <TeamSection />
      <CrowdfundingSection />
      <TestimonialsSection />
      <FinalCTA />
    </main>
  )
}


export default Funnel