import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="py-8 text-center">
      <div className="flex items-center justify-center">
        <h1 className="text-5xl font-bold md:text-6xl">
          <span className="text-[#FF7F50]">Border</span>
          <span className="text-slate-500">Genie</span>
        </h1>
      </div>
      <p className="max-w-3xl mx-auto mt-6 text-lg text-slate-700">
        This free online tool adds custom borders to your images to make them fit perfectly on Instagram. No email
        required, instant processing, and you can customize your borders exactly how you want them.
      </p>

      <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row">
        <Button size="lg" className="bg-[#FF7F50] hover:bg-[#FF6347]">
          Get Started
        </Button>
        <Button size="lg" variant="outline" className="border-[#FF7F50] text-[#FF7F50] hover:bg-[#FFF5F2]">
          Upgrade to Pro
        </Button>
      </div>
    </div>
  )
}

