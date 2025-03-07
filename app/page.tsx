import type { Metadata } from "next"
import Hero from "@/components/hero"
import ImageProcessor from "@/components/image-processor"
import Help from "@/components/help"

export const metadata: Metadata = {
  title: "BorderGenie - Add Borders to Your Instagram Photos",
  description: "Make your photos fit perfectly on Instagram with custom borders",
}

export default function Home() {
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

