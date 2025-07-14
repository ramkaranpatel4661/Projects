import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Shield, 
  AlertTriangle, 
  FileText,
  User,
  Phone,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { itemsApi } from '../utils/api';
import claimsApi from '../api/claimsApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ClaimItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [proofFiles, setProofFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [additionalProofFiles, setAdditionalProofFiles] = useState([]);
  const [additionalProofPreviews, setAdditionalProofPreviews] = useState([]);
  const [additionalProofDescriptions, setAdditionalProofDescriptions] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const watchIdType = watch('idType');

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await itemsApi.getItem(id);
      setItem(response.data.item);
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error('Failed to load item details');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (proofFiles.length + files.length > 3) {
      toast.error('Maximum 3 proof documents allowed');
      return;
    }

    const newFiles = [...proofFiles, ...files];
    setProofFiles(newFiles);

    // Create previews
    const newPreviews = [...filePreviews];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            type: 'image',
            url: e.target.result,
            name: file.name
          });
          setFilePreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({
          type: 'document',
          name: file.name
        });
        setFilePreviews([...newPreviews]);
      }
    });
  };

  const removeFile = (index) => {
    const newFiles = proofFiles.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setProofFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const handleAdditionalProofUpload = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (additionalProofFiles.length + files.length > 2) {
      toast.error('Maximum 2 additional proof images allowed');
      return;
    }

    const newFiles = [...additionalProofFiles, ...files];
    setAdditionalProofFiles(newFiles);

    // Create previews
    const newPreviews = [...additionalProofPreviews];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          type: 'image',
          url: e.target.result,
          name: file.name
        });
        setAdditionalProofPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalProof = (index) => {
    const newFiles = additionalProofFiles.filter((_, i) => i !== index);
    const newPreviews = additionalProofPreviews.filter((_, i) => i !== index);
    const newDescriptions = additionalProofDescriptions.filter((_, i) => i !== index);
    setAdditionalProofFiles(newFiles);
    setAdditionalProofPreviews(newPreviews);
    setAdditionalProofDescriptions(newDescriptions);
  };

  const handleDescriptionChange = (index, description) => {
    const newDescriptions = [...additionalProofDescriptions];
    newDescriptions[index] = description;
    setAdditionalProofDescriptions(newDescriptions);
  };

  const onSubmit = async (data) => {
    if (proofFiles.length === 0 && additionalProofFiles.length === 0) {
      toast.error('Please upload at least one proof document or additional proof image');
      return;
    }

    try {
      setSubmitting(true);

      const claimData = {
        itemId: id,
        fullName: data.fullName,
        phone: data.phone,
        idType: data.idType,
        idNumber: data.idNumber,
        description: data.description,
        additionalProof: data.additionalProof,
        proofDocuments: proofFiles,
        additionalProofImages: additionalProofFiles,
        additionalProofDescriptions: additionalProofDescriptions
      };

      await claimsApi.submitClaim(claimData);
      
      toast.success('Claim submitted successfully! The item owner will review your request.');
      navigate(`/item/${id}`);
    } catch (error) {
      console.error('Error submitting claim:', error);
      const message = error.response?.data?.message || 'Failed to submit claim';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600">Please log in to submit a claim for this item.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600">The item you're trying to claim doesn't exist.</p>
        </div>
      </div>
    );
  }

  const idTypes = [
    { value: 'aadhaar', label: 'Aadhaar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'passport', label: 'Passport' },
    { value: 'voter_id', label: 'Voter ID' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/item/${id}`)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Item
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Claim This Item</h1>
              <p className="text-gray-600">Submit verification details to claim: {item.title}</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Security & Privacy Notice</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your personal information will be encrypted and securely stored</li>
                  <li>• Only the item owner will see your verification details</li>
                  <li>• Sensitive data like ID numbers will be masked in most views</li>
                  <li>• False claims may result in account suspension</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    className="form-input"
                    placeholder="Enter your full legal name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^\+?[\d\s-()]+$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ID Verification */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                ID Verification
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">ID Type *</label>
                  <select
                    {...register('idType', { required: 'ID type is required' })}
                    className="form-input"
                  >
                    <option value="">Select ID type</option>
                    {idTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.idType && (
                    <p className="mt-1 text-sm text-red-600">{errors.idType.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    ID Number *
                    {watchIdType && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({idTypes.find(t => t.value === watchIdType)?.label})
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    {...register('idNumber', {
                      required: 'ID number is required',
                      minLength: { value: 4, message: 'ID number is too short' }
                    })}
                    className="form-input"
                    placeholder="Enter your ID number"
                  />
                  {errors.idNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.idNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Item Description */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Ownership Verification
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    Describe why this item belongs to you *
                  </label>
                  <textarea
                    {...register('description', {
                      required: 'Description is required',
                      minLength: { value: 20, message: 'Please provide more details (at least 20 characters)' }
                    })}
                    rows={4}
                    className="form-input"
                    placeholder="Provide specific details about the item that prove it's yours (e.g., when you lost it, unique features, contents, etc.)"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Additional Proof (Optional)</label>
                  <textarea
                    {...register('additionalProof')}
                    rows={3}
                    className="form-input"
                    placeholder="Any additional information that can help verify ownership (purchase details, serial numbers, etc.)"
                  />
                  
                  <div className="mt-4">
                    <label className="form-label">Additional Proof Images (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload additional proof images</p>
                      <p className="text-xs text-gray-500 mb-3">
                        Screenshots, receipts, or other supporting images. Maximum 2 additional files.
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleAdditionalProofUpload}
                        className="hidden"
                        id="additional-proof-upload"
                      />
                      <label
                        htmlFor="additional-proof-upload"
                        className="btn-outline cursor-pointer text-sm"
                      >
                        Choose Images
                      </label>
                    </div>

                    {additionalProofPreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {additionalProofPreviews.map((preview, index) => (
                          <div key={index} className="relative border rounded-lg p-3">
                            <img
                              src={preview.url}
                              alt={`Additional proof ${index + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                            <p className="text-xs text-gray-600 mt-2 truncate">{preview.name}</p>
                            <input
                              type="text"
                              placeholder="Describe this image (optional)"
                              value={additionalProofDescriptions[index] || ''}
                              onChange={(e) => handleDescriptionChange(index, e.target.value)}
                              className="w-full mt-2 px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalProof(index)}
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
              </div>
            </div>

            {/* Proof Documents */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Proof Documents *
              </h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload proof documents</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload photos of your ID, receipts, or other proof. Maximum 3 files, up to 5MB each.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label
                    htmlFor="proof-upload"
                    className="btn-primary cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>

                {filePreviews.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filePreviews.map((preview, index) => (
                      <div key={index} className="relative border rounded-lg p-3">
                        {preview.type === 'image' ? (
                          <img
                            src={preview.url}
                            alt={`Proof ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mt-2 truncate">{preview.name}</p>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
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

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Important Notice</h4>
                  <p className="text-sm text-yellow-800">
                    By submitting this claim, you confirm that all information provided is accurate and truthful. 
                    False claims may result in account suspension and legal action.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/item/${id}`)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Submitting Claim...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClaimItem;