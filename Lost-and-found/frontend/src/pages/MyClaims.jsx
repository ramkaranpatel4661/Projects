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
  User
} from 'lucide-react';
import claimsApi from '../api/claimsApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MyClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyClaims();
    }
  }, [user]);

  const fetchMyClaims = async () => {
    try {
      setLoading(true);
      const response = await claimsApi.getMyClaims();
      setClaims(response.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load your claims');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'approved':
        return 'Approved - Arrange Pickup';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Item Received';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600">Please log in to view your claims.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            My Claims
          </h1>
          <p className="text-lg text-gray-600">
            Track the status of your item claims
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Claims Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any claims for items yet.
            </p>
            <Link to="/browse" className="btn-primary">
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {claims.filter(claim => claim.status !== 'completed').map((claim) => (
              <div key={claim._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start space-x-4 mb-4 lg:mb-0">
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
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {claim.item.title}
                        </h3>
                        <span className={getStatusBadge(claim.status)}>
                          {getStatusText(claim.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Claimed {new Date(claim.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span>Owner: {claim.itemOwner?.name}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {claim.verificationDetails.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(claim.status)}
                      <span className="text-sm font-medium text-gray-700">
                        {getStatusText(claim.status)}
                      </span>
                    </div>
                    
                    <Link
                      to={`/item/${claim.item._id}`}
                      className="btn-outline flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Item
                    </Link>
                  </div>
                </div>

                {/* Status-specific information */}
                {claim.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your claim is being reviewed by the item owner. You'll be notified once they make a decision.
                    </p>
                  </div>
                )}

                {claim.status === 'approved' && !claim.handoverDetails?.completedAt && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Great! Your claim has been approved. Please coordinate with the owner to arrange pickup.
                    </p>
                  </div>
                )}

                {claim.status === 'rejected' && claim.ownerReview?.notes && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 mb-1">
                      <strong>Reason for rejection:</strong>
                    </p>
                    <p className="text-sm text-red-700">
                      {claim.ownerReview.notes}
                    </p>
                  </div>
                )}

              </div>
            ))}

            {/* Completed Claims Section */}
            {claims.filter(claim => claim.status === 'completed').length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Successfully Returned Items
                  </h2>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {claims.filter(claim => claim.status === 'completed').length} Items Returned
                  </div>
                </div>
                
                <div className="space-y-4">
                  {claims.filter(claim => claim.status === 'completed').map((claim) => (
                    <div key={claim._id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
                      <div className="flex items-start space-x-4">
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
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {claim.item.title}
                            </h3>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                              Successfully Returned
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Returned on {new Date(claim.handoverDetails.completedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              <span>Returned by: {claim.itemOwner?.name}</span>
                            </div>
                          </div>
                          
                          {claim.handoverDetails.location && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>Pickup location: {claim.handoverDetails.location}</span>
                            </div>
                          )}
                          
                          {claim.handoverDetails.notes && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                              <p className="text-sm text-gray-700">
                                <strong>Handover notes:</strong> {claim.handoverDetails.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <Link
                            to={`/handover-success/${claim._id}`}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            View Certificate
                          </Link>
                          <Link
                            to={`/item/${claim.item._id}`}
                            className="text-sm text-gray-600 hover:text-gray-700"
                          >
                            View Item
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClaims;