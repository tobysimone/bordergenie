'use client'

import Hero from "@/components/hero"
import ImageProcessor from "@/components/image-processor"
import Help from "@/components/help"
import useTrackingScript from "@/hooks/use-tracking-script";

export default function Home() {
  useTrackingScript();

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-4 py-8 mx-auto">
        <Hero />
        <ImageProcessor />
        <Help />
      </div>
    </div>
  )
}

