import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package,
  Eye,
  Calendar,
  User,
  Phone,
  CreditCard,
  MessageSquare,
  FileText
} from 'lucide-react';
import claimsApi from '../api/claimsApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ClaimReviews = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingClaim, setReviewingClaim] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPendingClaims();
    }
  }, [user]);

  const fetchPendingClaims = async () => {
    try {
      setLoading(true);
      console.log('🔄 [ClaimReviews] Fetching pending claims...');
      const response = await claimsApi.getPendingReviews();
      console.log('✅ [ClaimReviews] Pending claims fetched:', response.data);
      setClaims(response.data);
    } catch (error) {
      console.error('❌ [ClaimReviews] Error fetching pending claims:', error);
      const message = error.response?.data?.message || 'Failed to load pending claims';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (claimId, decision) => {
    if (!reviewNotes.trim() && decision === 'rejected') {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setSubmitting(true);
      await claimsApi.reviewClaim(claimId, decision, reviewNotes);
      
      // Remove the reviewed claim from the list
      setClaims(claims.filter(claim => claim._id !== claimId));
      setReviewingClaim(null);
      setReviewNotes('');
      
      toast.success(`Claim ${decision} successfully`);
    } catch (error) {
      console.error('Error reviewing claim:', error);
      toast.error('Failed to review claim');
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewModal = (claim) => {
    setReviewingClaim(claim);
    setReviewNotes('');
  };

  const closeReviewModal = () => {
    setReviewingClaim(null);
    setReviewNotes('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600">Please log in to review claims.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Claim Reviews
          </h1>
          <p className="text-lg text-gray-600">
            Review claims submitted for your found items
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Claims</h3>
            <p className="text-gray-600 mb-6">
              You don't have any claims waiting for review.
            </p>
            <Link to="/my-items" className="btn-primary">
              View My Items
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <div key={claim._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start space-x-4 mb-4 lg:mb-0 flex-1">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {claim.item.imageUrls && claim.item.imageUrls.length > 0 ? (
                        <img
                          src={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${claim.item.imageUrls[0]}`}
                          alt={claim.item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Claim for: {claim.item.title}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span><strong>Claimant:</strong> {claim.verificationDetails.fullName}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span><strong>Phone:</strong> {claim.maskedPhone}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <CreditCard className="w-4 h-4 mr-2" />
                            <span><strong>ID:</strong> {claim.maskedIdNumber}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span><strong>Submitted:</strong> {new Date(claim.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span><strong>Status:</strong> Pending Review</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-start text-sm text-gray-600">
                          <MessageSquare className="w-4 h-4 mr-2 mt-0.5" />
                          <div>
                            <strong>Ownership Description:</strong>
                            <p className="mt-1 text-gray-700">{claim.verificationDetails.description}</p>
                          </div>
                        </div>
                      </div>

                      {claim.verificationDetails.additionalProof && (
                        <div className="mb-4">
                          <div className="flex items-start text-sm text-gray-600">
                            <FileText className="w-4 h-4 mr-2 mt-0.5" />
                            <div>
                              <strong>Additional Proof:</strong>
                              <p className="mt-1 text-gray-700">{claim.verificationDetails.additionalProof}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {claim.proofDocuments && claim.proofDocuments.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Proof Documents: {claim.proofDocuments.length} file(s) uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 lg:ml-4">
                    <button
                      onClick={() => openReviewModal(claim)}
                      className="btn-primary flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review Claim
                    </button>
                    <Link
                      to={`/item/${claim.item._id}`}
                      className="btn-outline flex items-center justify-center"
                    >
                      View Item
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {reviewingClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Review Claim</h2>
                  <button
                    onClick={closeReviewModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Item: {reviewingClaim.item.title}</h3>
                    <p className="text-sm text-gray-600">Claimant: {reviewingClaim.verificationDetails.fullName}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Why they believe it's theirs:</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {reviewingClaim.verificationDetails.description}
                    </p>
                  </div>

                  {reviewingClaim.verificationDetails.additionalProof && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Additional Proof:</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {reviewingClaim.verificationDetails.additionalProof}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Verification Details:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p><strong>Phone:</strong> {reviewingClaim.maskedPhone}</p>
                      <p><strong>ID Number:</strong> {reviewingClaim.maskedIdNumber}</p>
                      <p><strong>Proof Documents:</strong> {reviewingClaim.proofDocuments?.length || 0} file(s)</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="form-label">Review Notes</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    className="form-input"
                    placeholder="Add notes about your decision (required for rejection)"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => handleReview(reviewingClaim._id, 'approved')}
                    disabled={submitting}
                    className="btn-success flex-1 flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {submitting ? 'Processing...' : 'Approve Claim'}
                  </button>
                  <button
                    onClick={() => handleReview(reviewingClaim._id, 'rejected')}
                    disabled={submitting}
                    className="btn-danger flex-1 flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {submitting ? 'Processing...' : 'Reject Claim'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimReviews;