import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, MapPin, Calendar, Phone, Mail, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { itemsApi } from '../utils/api'
import toast from 'react-hot-toast'

const PostItem = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      type: 'found',
      preferredMethod: 'chat',
      priority: 'medium',
      showPhone: false,
      showEmail: false
    }
  })

  const watchType = watch('type')

  const categories = [
    'Electronics', 'Clothing', 'Accessories', 'Documents', 'Keys',
    'Bags', 'Jewelry', 'Books', 'Sports Equipment', 'Pet Items', 'Toys', 'Other'
  ]

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || [])

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)

    // Create previews
    const newPreviews = [...imagePreviews]
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push(e.target?.result)
        setImagePreviews([...newPreviews])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const onSubmit = async (data) => {
  if (images.length === 0) {
    toast.error('Please upload at least one image')
    return
  }

  try {
    setSubmitting(true)

    const postData = {
      title: data.title,
      description: data.description,
      category: data.category,
      type: data.type,
      location: {
        address: data.address,
        city: data.city
      },
      contactInfo: {
        name: data.contactName,
        preferredMethod: data.preferredMethod,
        phone: data.contactPhone,
        email: data.contactEmail,
        showPhone: data.showPhone,
        showEmail: data.showEmail
      },
      priority: data.priority,
      images
    }

    if (data.type === 'found' && data.dateFound) {
      postData.dateFound = data.dateFound
    }

    if (data.type === 'lost' && data.dateLost) {
      postData.dateLost = data.dateLost
    }

    const response = await itemsApi.createItem(postData)
    toast.success('Item posted successfully!')
    navigate(`/item/${response.data.item._id}`)
  } catch (error) {
    console.error('Error posting item:', error)
    const message = error?.response?.data?.message || 'Failed to post item'
    toast.error(message)
  } finally {
    setSubmitting(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Post an Item
          </h1>
          <p className="text-lg text-gray-600">
            Help reunite lost items with their owners or report found items
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Item Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative">
                <input
                  type="radio"
                  value="found"
                  {...register('type', { required: 'Please select item type' })}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  watchType === 'found' 
                    ? 'border-success-500 bg-success-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <h3 className="font-semibold text-gray-900 mb-2">Found Item</h3>
                  <p className="text-sm text-gray-600">
                    I found something and want to return it to its owner
                  </p>
                </div>
              </label>

              <label className="relative">
                <input
                  type="radio"
                  value="lost"
                  {...register('type', { required: 'Please select item type' })}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  watchType === 'lost' 
                    ? 'border-error-500 bg-error-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <h3 className="font-semibold text-gray-900 mb-2">Lost Item</h3>
                  <p className="text-sm text-gray-600">
                    I lost something and hope someone found it
                  </p>
                </div>
              </label>
            </div>
            {errors.type && (
              <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  {...register('title', { 
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' },
                    maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
                  })}
                  className="form-input"
                  placeholder="Brief description of the item"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Category *</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="form-input"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Priority</label>
                <select
                  {...register('priority')}
                  className="form-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Description *</label>
                <textarea
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters' }
                  })}
                  rows={4}
                  className="form-input"
                  placeholder="Detailed description of the item including color, size, brand, etc."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Images *</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload images of the item</p>
                <p className="text-sm text-gray-500 mb-4">Maximum 5 images, up to 5MB each</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="btn-primary cursor-pointer"
                >
                  Choose Images
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location and Date */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location & Date</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address *
                </label>
                <input
                  type="text"
                  {...register('address', { required: 'Address is required' })}
                  className="form-input"
                  placeholder="Where was it found/lost?"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">City *</label>
                <input
                  type="text"
                  {...register('city', { required: 'City is required' })}
                  className="form-input"
                  placeholder="City name"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date {watchType === 'found' ? 'Found' : 'Lost'} *
                </label>
                <input
                  type="date"
                  {...register(watchType === 'found' ? 'dateFound' : 'dateLost', { 
                    required: `Date ${watchType} is required` 
                  })}
                  className="form-input"
                  max={new Date().toISOString().split('T')[0]}
                />
                {watchType === 'found' && errors.dateFound && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateFound.message}</p>
                )}
                {watchType === 'lost' && errors.dateLost && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateLost.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-6">
              <div>
                <label className="form-label">
                  <User className="w-4 h-4 inline mr-1" />
                  Contact Name *
                </label>
                <input
                  type="text"
                  {...register('contactName', { required: 'Contact name is required' })}
                  className="form-input"
                  placeholder="Your name or preferred contact name"
                />
                {errors.contactName && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...register('contactPhone')}
                    className="form-input"
                    placeholder="Your phone number"
                  />
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      {...register('showPhone')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Show phone number publicly</span>
                  </label>
                </div>

                <div>
                  <label className="form-label">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('contactEmail')}
                    className="form-input"
                    placeholder="Your email address"
                  />
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      {...register('showEmail')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Show email address publicly</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Preferred Contact Method</label>
                <select
                  {...register('preferredMethod')}
                  className="form-input"
                >
                  <option value="chat">Chat (Recommended)</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/browse')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Posting...' : 'Post Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostItem