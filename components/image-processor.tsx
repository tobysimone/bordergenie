"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, ChevronDown, Download, Lock, Trash2, Upload } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface ProcessedImage {
  id: string
  originalFile: File
  originalImage: HTMLImageElement
  previewUrl: string
  aspectRatio: string
  width: number
  height: number
}

type AspectRatio = "1:1" | "4:5" | "16:9" | "custom"

export default function ImageProcessor() {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [borderColor, setBorderColor] = useState("#ffffff")
  const [borderWidth, setBorderWidth] = useState(50)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1")
  const [isPro, setIsPro] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return

      // Check if user is trying to upload more than 2 files without Pro
      if (!isPro && files.length > 2) {
        toast({
          title: "Free Plan Limit Reached",
          description:
            "You can only upload 2 images at a time with the free plan. Upgrade to Pro for unlimited uploads!",
          variant: "destructive",
        })
        return
      }

      // Process each file
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return

        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const aspectRatio = getAspectRatioName(img.width / img.height)

            setImages((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).substring(2, 9),
                originalFile: file,
                originalImage: img,
                previewUrl: e.target?.result as string,
                aspectRatio,
                width: img.width,
                height: img.height,
              },
            ])
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      })
    },
    [isPro],
  )

  const getAspectRatioName = (ratio: number): string => {
    if (Math.abs(ratio - 1) < 0.1) return "Square (1:1)"
    if (Math.abs(ratio - 4 / 5) < 0.1) return "Portrait (4:5)"
    if (Math.abs(ratio - 16 / 9) < 0.1) return "Landscape (16:9)"
    return "Custom"
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFileUpload(e.dataTransfer.files)
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const getAspectRatioDimensions = (aspectRatio: AspectRatio, originalWidth: number, originalHeight: number) => {
    switch (aspectRatio) {
      case "1:1":
        return { width: 1080, height: 1080 }
      case "4:5":
        return { width: 1080, height: 1350 }
      case "16:9":
        return { width: 1080, height: 607 }
      case "custom":
      default:
        // Maintain original aspect ratio but scale to Instagram width
        const scale = 1080 / originalWidth
        return {
          width: 1080,
          height: Math.round(originalHeight * scale),
        }
    }
  }

  // Draw image on canvas with border
  const drawImageOnCanvas = (canvas: HTMLCanvasElement, image: ProcessedImage) => {
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get dimensions based on selected aspect ratio
    const dimensions = getAspectRatioDimensions(aspectRatio, image.width, image.height)

    // Set canvas size to include border
    const canvasWidth = dimensions.width + borderWidth * 2
    const canvasHeight = dimensions.height + borderWidth * 2

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Draw border (background)
    ctx.fillStyle = borderColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Calculate scaling to fit image in the inner rectangle while maintaining aspect ratio
    const innerWidth = dimensions.width
    const innerHeight = dimensions.height

    const originalAspect = image.width / image.height
    const targetAspect = innerWidth / innerHeight

    let drawWidth, drawHeight, offsetX, offsetY

    if (originalAspect > targetAspect) {
      // Image is wider than target area
      drawWidth = innerWidth
      drawHeight = innerWidth / originalAspect
      offsetX = borderWidth
      offsetY = borderWidth + (innerHeight - drawHeight) / 2
    } else {
      // Image is taller than target area
      drawHeight = innerHeight
      drawWidth = innerHeight * originalAspect
      offsetX = borderWidth + (innerWidth - drawWidth) / 2
      offsetY = borderWidth
    }

    // Draw the image
    ctx.drawImage(image.originalImage, offsetX, offsetY, drawWidth, drawHeight)
  }

  // Update canvases when settings change
  useEffect(() => {
    images.forEach((image) => {
      const canvas = canvasRefs.current.get(image.id)
      if (canvas) {
        drawImageOnCanvas(canvas, image)
      }
    })
  }, [images, borderColor, borderWidth, aspectRatio])

  // Set canvas ref for an image
  const setCanvasRef = (id: string, canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      canvasRefs.current.set(id, canvas)

      // Find the image and draw it
      const image = images.find((img) => img.id === id)
      if (image) {
        drawImageOnCanvas(canvas, image)
      }
    }
  }

  const downloadImage = (image: ProcessedImage) => {
    const canvas = canvasRefs.current.get(image.id)
    if (!canvas) return

    // Create a download link
    const link = document.createElement("a")
    link.download = `bordergenie_${image.originalFile.name.split(".")[0]}.png`

    // Convert canvas to blob and create object URL
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, "image/png")
  }

  const downloadAll = () => {
    images.forEach((image) => {
      downloadImage(image)
    })
  }

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    setAspectRatio(ratio)
  }

  const upgradeToProDialog = (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[#FF7F50] text-[#FF7F50] hover:bg-[#FFF5F2]">
          Upgrade to Pro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to BorderGenie Pro</DialogTitle>
          <DialogDescription>Unlock premium features and enhance your Instagram content</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex flex-col h-full p-6">
                <h3 className="mb-2 text-lg font-bold">Monthly</h3>
                <p className="mb-4 text-3xl font-bold">
                  $4.99<span className="text-sm font-normal">/month</span>
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center gap-2">✓ Unlimited uploads</li>
                  <li className="flex items-center gap-2">✓ Premium borders</li>
                  <li className="flex items-center gap-2">✓ Batch processing</li>
                </ul>
                <div className="flex-grow"></div>
                <Button
                  className="w-full bg-[#FF7F50] hover:bg-[#FF6347]"
                  onClick={() => {
                    setIsPro(true)
                    toast({
                      title: "Pro Plan Activated!",
                      description: "You now have access to all premium features.",
                    })
                  }}
                >
                  Subscribe
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col h-full p-6">
                <h3 className="mb-2 text-lg font-bold">Lifetime</h3>
                <p className="mb-4 text-3xl font-bold">$49.99</p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center gap-2">✓ Unlimited uploads</li>
                  <li className="flex items-center gap-2">✓ Premium borders</li>
                  <li className="flex items-center gap-2">✓ Batch processing</li>
                  <li className="flex items-center gap-2">✓ One-time payment</li>
                </ul>
                <div className="flex-grow"></div>
                <Button
                  className="w-full bg-[#FF7F50] hover:bg-[#FF6347]"
                  onClick={() => {
                    setIsPro(true)
                    toast({
                      title: "Pro Plan Activated!",
                      description: "You now have lifetime access to all premium features.",
                    })
                  }}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="py-8">
      <div className="flex items-center justify-end mb-6">
        <div className="flex gap-4">
          {/* {!isPro && upgradeToProDialog} */}
          {images.length > 0 && (
            <Button variant="outline" onClick={downloadAll} className="flex items-center gap-2">
              <Download size={16} />
              Download All
            </Button>
          )}
        </div>
      </div>

      <div
        className="p-12 text-center transition-colors border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center">
          <Upload size={48} className="mb-4 text-slate-400" />
          <h3 className="mb-2 text-xl font-semibold">Drop Your Files Here</h3>
          <p className="mb-4 text-slate-500">or click to select files from your device</p>
          {/* {!isPro && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-md text-amber-600 bg-amber-50">
              <AlertCircle size={16} />
              <span>Free plan: Maximum 2 images at a time</span>
            </div>
          )} */}
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-8 space-y-8">
          <div className="p-6 bg-white border rounded-lg">
            <h3 className="mb-4 text-xl font-semibold">Border Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="font-medium">Border Width</label>
                  <span>{borderWidth}px</span>
                </div>
                <Slider
                  value={[borderWidth]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={(value) => setBorderWidth(value[0])}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Border Color</label>
                <div className="flex gap-2">
                  {["#ffffff", "#000000", "#f5f5f5", "#e0e0e0", "#d4d4d4"].map((color) => (
                    <div
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer border ${borderColor === color ? "ring-2 ring-[#FF7F50] ring-offset-2" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBorderColor(color)}
                    />
                  ))}

                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-8 h-8 p-0 overflow-hidden border-0 rounded-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="font-medium">Aspect Ratio</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        {aspectRatio === "1:1"
                          ? "Square (1:1)"
                          : aspectRatio === "4:5"
                            ? "Portrait (4:5)"
                            : aspectRatio === "16:9"
                              ? "Landscape (16:9)"
                              : "Custom"}
                        <ChevronDown size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleAspectRatioChange("1:1")}>Square (1:1)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAspectRatioChange("4:5")}>Portrait (4:5)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAspectRatioChange("16:9")}>
                        Landscape (16:9)
                      </DropdownMenuItem>
                      {isPro ? (
                        <DropdownMenuItem onClick={() => handleAspectRatioChange("custom")}>Custom</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                          <Lock size={14} /> Custom (Pro only)
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Preview</h3>
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image) => (
                  <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card>
                        <CardContent className="relative p-0">
                          <div className="relative overflow-hidden aspect-square">
                            <canvas
                              ref={(canvas) => setCanvasRef(image.id, canvas)}
                              className="object-contain w-full h-full"
                            />
                          </div>
                          <div className="absolute flex gap-2 top-2 right-2">
                            <Button
                              size="icon"
                              variant="destructive"
                              className="w-8 h-8 rounded-full"
                              onClick={() => removeImage(image.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4">
                            <div>
                              <p className="text-sm font-medium truncate">{image.originalFile.name}</p>
                              <p className="text-xs text-slate-500">{image.aspectRatio}</p>
                            </div>
                            <Button
                              size="sm"
                              className="bg-[#FF7F50] hover:bg-[#FF6347]"
                              onClick={() => downloadImage(image)}
                            >
                              <Download size={14} className="mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  )
}

