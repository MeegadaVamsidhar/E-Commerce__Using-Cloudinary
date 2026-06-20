import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage, FiVideo, FiCheck } from 'react-icons/fi'
import { uploadImage, uploadMultipleImages, uploadVideo } from '../../services/uploadService'
import toast from 'react-hot-toast'

const FileUpload = ({ type = 'image', multiple = false, onFilesUploaded, existingFiles = [], onRemoveFile }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const fileInputRef = useRef(null)

  const isVideo = type === 'video'
  const accept = isVideo ? 'video/*' : 'image/*'
  const maxFiles = multiple ? (isVideo ? 3 : 5) : 1
  const canUpload = existingFiles.length < maxFiles

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (!multiple && files.length > 1) {
      toast.error('Only one file allowed')
      return
    }

    if (existingFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} ${isVideo ? 'videos' : 'images'} allowed`)
      return
    }

    setUploading(true)
    const progress = {}
    files.forEach((_, i) => { progress[i] = 0 })
    setUploadProgress(progress)

    try {
      const formData = new FormData()
      if (multiple) {
        files.forEach(file => formData.append(isVideo ? 'videos' : 'images', file))
        const { data } = isVideo
          ? await uploadVideo(formData)
          : await uploadMultipleImages(formData)
        const uploaded = isVideo ? [data] : data.images
        onFilesUploaded?.(uploaded)
        toast.success(`${uploaded.length} ${isVideo ? 'video(s)' : 'image(s)'} uploaded!`)
      } else {
        formData.append(isVideo ? 'video' : 'image', files[0])
        const { data } = isVideo
          ? await uploadVideo(formData)
          : await uploadImage(formData)
        onFilesUploaded?.(isVideo ? [data] : [{ public_id: data.public_id, url: data.url }])
        toast.success(`${isVideo ? 'Video' : 'Image'} uploaded!`)
      }
      setUploadProgress({})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
      setUploadProgress({})
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {/* Existing files preview */}
      {existingFiles.length > 0 && (
        <div className={`grid gap-3 ${isVideo ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
          {existingFiles.map((file, idx) => (
            <div key={file.public_id || idx} className="relative group rounded-xl overflow-hidden border border-white/10">
              {isVideo ? (
                <div className="aspect-video bg-black/50 flex items-center justify-center">
                  <video src={file.url} className="w-full h-full object-cover" controls />
                </div>
              ) : (
                <img src={file.url} alt={`Upload ${idx + 1}`} className="w-full h-24 object-cover" />
              )}
              {onRemoveFile && (
                <button
                  onClick={() => onRemoveFile(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX size={12} className="text-white" />
                </button>
              )}
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-white text-[10px] flex items-center gap-1">
                <FiCheck size={8} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canUpload && (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            uploading
              ? 'border-primary-500/50 bg-primary-500/5'
              : 'border-white/20 hover:border-primary-500/50 hover:bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {isVideo ? <FiVideo size={24} className="text-slate-500" /> : <FiImage size={24} className="text-slate-500" />}
              <p className="text-slate-400 text-sm">
                Click to upload {isVideo ? 'video' : 'image'}
                {multiple && ` (up to ${maxFiles - existingFiles.length} more)`}
              </p>
              <p className="text-slate-600 text-xs">
                {isVideo ? 'MP4, MOV, AVI, WebM (max 100MB)' : 'JPG, PNG, WebP, GIF (max 10MB)'}
              </p>
            </div>
          )}
        </div>
      )}

      {!canUpload && (
        <p className="text-slate-500 text-xs text-center">Maximum {maxFiles} {isVideo ? 'videos' : 'images'} reached</p>
      )}
    </div>
  )
}

export default FileUpload
