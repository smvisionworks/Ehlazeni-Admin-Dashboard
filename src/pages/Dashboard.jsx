// components/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { database } from '../firebase'
import { ref, onValue, update, remove } from 'firebase/database'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import MainHeader from '../components/MainHeader'

const Dashboard = () => {
  const [applications, setApplications] = useState([])
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for changes in ALL applications
    const applicationsRef = ref(database, 'application/pending')
    const applicationsUnsubscribe = onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const applicationsList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }))
        setApplications(applicationsList)
      } else {
        setApplications([])
      }
      setLoading(false)
    })

    return () => {
      applicationsUnsubscribe()
    }
  }, [])

  const handleApprove = async (applicationId) => {
    try {
      const applicationRef = ref(database, `application/pending/${applicationId}`)

      await update(applicationRef, {
        status: "approved",
        approvedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      })

      setSelectedApplication(null)
    } catch (error) {
      console.error("Error approving application:", error)
      alert("Error approving application: " + error.message)
    }
  }

  const handleReject = async (applicationId) => {
    try {
      const applicationRef = ref(database, `application/pending/${applicationId}`)

      await update(applicationRef, {
        status: "rejected",
        rejectedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      })

      setSelectedApplication(null)
    } catch (error) {
      console.error("Error rejecting application:", error)
      alert("Error rejecting application: " + error.message)
    }
  }

  const handleDelete = async (applicationId) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      const applicationRef = ref(database, `application/pending/${applicationId}`)
      await remove(applicationRef)
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('Error deleting application: ' + error.message)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Filter applications based on active tab and search term
  const filteredApplications = applications.filter(app => {
    // First filter by status
    const statusMatch = app.status === activeTab

    // Then filter by search term if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        app.firstName?.toLowerCase().includes(searchLower) ||
        app.lastName?.toLowerCase().includes(searchLower) ||
        app.email?.toLowerCase().includes(searchLower) ||
        app.studentCode?.toLowerCase().includes(searchLower)

      return statusMatch && matchesSearch
    }

    return statusMatch
  })

  // Calculate counts based on application status
  const getApplicationCounts = () => {
    const pending = applications.filter(app => app.status === 'pending').length
    const approved = applications.filter(app => app.status === 'approved').length
    const rejected = applications.filter(app => app.status === 'rejected').length

    return {
      pending,
      approved,
      rejected,
      total: applications.length
    }
  }

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />   {/* <-- show header during loading */}

      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    </div>
  )
}


  const counts = getApplicationCounts()

const handlePaymentApprove = async (applicationId) => {
  try {
    const applicationRef = ref(database, `application/pending/${applicationId}`);

    await update(applicationRef, {
      "payment/registrationFee": "paid",
      "payment/registrationFeeDate": new Date().toISOString(),
      "payment/approvedBy": auth.currentUser?.uid || "admin"
    });

    alert("Payment marked as PAID!");
  } catch (error) {
    console.error("Error approving payment:", error);
    alert("Error approving payment: " + error.message);
  }
};

  return (

    <><MainHeader />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
     

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{counts.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{counts.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{counts.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{counts.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { key: 'pending', name: 'Pending', count: counts.pending },
                { key: 'approved', name: 'Approved', count: counts.approved },
                { key: 'rejected', name: 'Rejected', count: counts.rejected }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by name, email, or student code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="overflow-hidden">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'pending'
                    ? 'No pending applications to review.'
                    : `No ${activeTab} applications found.`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <div
                    key={application.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedApplication(application)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {application.firstName?.[0]}{application.lastName?.[0]}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {application.firstName} {application.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">{application.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500">Code: {application.studentCode}</span>
                            <span className="text-sm text-gray-500">ID: {application.idNumber}</span>
                            <span className="text-sm text-gray-500">
                              Applied: {new Date(application.applicationDate).toLocaleDateString()}
                            </span>
                            {application.status !== 'pending' && (
                              <span className={`text-sm px-2 py-1 rounded-full ${application.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {application.status}
                              </span>
                            )}

                            {application.payment?.registrationFee === "paid" && (
                              <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                Payment: Paid
                              </span>
                            )}

                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApprove(application.id)
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReject(application.id)
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(application.id)
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Application Details - {selectedApplication.firstName} {selectedApplication.lastName}
                  </h2>
                  {selectedApplication.status !== 'pending' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedApplication.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {selectedApplication.status.toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedApplication.firstName} {selectedApplication.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.idNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Race</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.race}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Code</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.studentCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedApplication.status}</p>
                  </div>
                  {selectedApplication.approvedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Approved Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedApplication.approvedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedApplication.rejectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rejected Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedApplication.rejectedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedApplication.payment?.registrationFee === "paid"
                      ? "Registration Fee Paid"
                      : "Not Paid"}
                  </p>
                </div>

                {selectedApplication.payment?.registrationFeeDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedApplication.payment.registrationFeeDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

              </div>

              {/* Address Information */}
              {selectedApplication.address && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.address.line1}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.address.line2}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.address.city}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Province</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.address.province}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.address.postalCode}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.address.country}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Highest Grade</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.highestGrade}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Attendance Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.attendanceType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Previous School</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.previousSchool}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">School Province</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.schoolProvince}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Subjects</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.subjects}</p>
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              {selectedApplication.guardian && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardian Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.guardian.firstName} {selectedApplication.guardian.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.guardian.idNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.guardian.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.guardian.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.guardian.employmentStatus}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Workplace</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.guardian.workplace}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleReject(selectedApplication.id)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApplication.id)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Application
                  </button>
                </div>


              )}

              {selectedApplication.status === 'approved' && !selectedApplication.payment?.registrationFee && (
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handlePaymentApprove(selectedApplication.id)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Approve Payment
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default Dashboard