import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Calendar, 
  User, 
  Shield, 
  Package,
  MapPin,
  Clock,
  Star
} from 'lucide-react';
import claimsApi from '../api/claimsApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const HandoverSuccess = () => {
  const { claimId } = useParams();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (claimId) {
      fetchClaimDetails();
    }
  }, [claimId]);

  const fetchClaimDetails = async () => {
    try {
      setLoading(true);
      const response = await claimsApi.getClaim(claimId);
      setClaim(response.data);
    } catch (error) {
      console.error('Error fetching claim details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!claim || claim.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Request</h2>
          <p className="text-gray-600">This handover has not been completed yet.</p>
        </div>
      </div>
    );
  }

  const isClaimant = claim.claimant._id === user?._id;
  const otherParty = isClaimant ? claim.itemOwner : claim.claimant;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ✅ Item Handover Completed!
          </h1>
          <p className="text-xl text-gray-600">
            The item has been successfully {isClaimant ? 'returned to you' : 'given to the rightful owner'}
          </p>
        </div>

        {/* Main Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Item Details */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Item Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{claim.item.title}</p>
                    <p className="text-sm text-gray-600">{claim.item.type === 'found' ? 'Found Item' : 'Lost Item'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isClaimant ? 'Returned by' : 'Returned to'}: {otherParty.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {claim.maskedPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-900">Handover Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {new Date(claim.handoverDetails.completedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {claim.handoverDetails.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Handover Location</p>
                      <p className="text-sm text-gray-600">{claim.handoverDetails.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security & Privacy Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Security & Privacy</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Verification Completed</p>
                    <p className="text-sm text-gray-600">
                      Claimant's identity was verified with ID: {claim.maskedIdNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Claim Timeline</p>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Approved: {new Date(claim.ownerReview.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Data Protection</p>
                    <p className="text-sm text-gray-600">
                      All sensitive information was encrypted and stored securely
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {claim.handoverDetails.notes && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Handover Notes</h3>
              <p className="text-gray-700">{claim.handoverDetails.notes}</p>
            </div>
          )}
        </div>

        {/* Status Update */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Item Status Updated</h3>
              <p className="text-blue-800">
                🔒 The item post has been marked as "Closed" and is no longer visible to other users.
              </p>
            </div>
          </div>
        </div>

        {/* Community Impact */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🎉 Thank You for Being Part of Our Community!
            </h3>
            <p className="text-gray-700 mb-4">
              {isClaimant 
                ? "You've successfully reclaimed your lost item through our secure verification process."
                : "You've helped return a lost item to its rightful owner. Your kindness makes a difference!"
              }
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-bold text-lg text-green-600">✓</div>
                <div>Secure Process</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-blue-600">✓</div>
                <div>Verified Identity</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-purple-600">✓</div>
                <div>Safe Handover</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/browse"
            className="btn-primary"
          >
            Browse More Items
          </Link>
          <Link
            to={isClaimant ? "/my-claims" : "/my-items"}
            className="btn-outline"
          >
            {isClaimant ? "View My Claims" : "View My Items"}
          </Link>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            This handover was completed securely through our verified claim system.
            <br />
            Thank you for using Lost & Found responsibly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HandoverSuccess;