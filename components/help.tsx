export default function Help() {
  return (
    <div className="grid grid-cols-1 gap-6 mt-12 text-left md:grid-cols-3">
      <div className="p-4">
        <div className="mb-2 text-2xl font-bold">1</div>
        <h3 className="mb-2 text-xl font-semibold">Upload Your Images</h3>
        <p className="text-slate-600">
          Drag and drop your photos onto the upload area or click to select files from your device.
        </p>
      </div>
      <div className="p-4">
        <div className="mb-2 text-2xl font-bold">2</div>
        <h3 className="mb-2 text-xl font-semibold">Customize Borders</h3>
        <p className="text-slate-600">
          Adjust the border thickness, color, and style to match your Instagram aesthetic.
        </p>
      </div>
      <div className="p-4">
        <div className="mb-2 text-2xl font-bold">3</div>
        <h3 className="mb-2 text-xl font-semibold">Download & Share</h3>
        <p className="text-slate-600">Download your perfectly formatted images ready to post on Instagram.</p>
      </div>
    </div>
  )
}