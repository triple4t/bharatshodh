import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../services/api";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  LogOut,
  Search,
  Filter,
  Trash2,
  Mail,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Menu,
  X,
  FileText,
  Upload,
} from "lucide-react";

interface User {
  _id: string;
  email: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

interface Stats {
  total_users: number;
  pending_users: number;
  approved_users: number;
  rejected_users: number;
  active_users: number;
  total_admins: number;
}

interface Document {
  id: string;
  filename: string;
  upload_date: string;
  uploaded_by: string;
  doc_type: string;
  file_size: number;
  chunk_count: number;
  status?: "uploaded" | "processing" | "completed" | "failed";
}

export default function Dashboard() {
  const { admin, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Document management state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'embedding' | 'completed' | 'error'>('idle');
  const [successMessage, setSuccessMessage] = useState("");

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, usersRes, docsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getAllUsers(),
          adminApi.getDocuments(),
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data);
        setDocuments(docsRes.data.documents || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Polling for processing documents
  useEffect(() => {
    const processingDocs = documents.filter(doc => doc.status === 'processing' || doc.status === 'uploaded');
    
    if (processingDocs.length === 0) return;

    const pollInterval = setInterval(async () => {
      try {
        const docsRes = await adminApi.getDocuments();
        const newDocs = docsRes.data.documents || [];
        
        // Deep compare or just update if any status changed
        const hasChanges = JSON.stringify(newDocs) !== JSON.stringify(documents);
        if (hasChanges) {
          setDocuments(newDocs);
          
          // Check if all are now completed
          const stillProcessing = newDocs.some((doc: Document) => doc.status === 'processing');
          if (!stillProcessing) {
            console.log("All documents processed");
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [documents]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    if (statusFilter) {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter]);

  const handleApprove = async (userId: string) => {
    setIsActionLoading(true);
    try {
      await adminApi.approveUser(userId);
      const updatedUsers = users.map((u) =>
        u._id === userId ? { ...u, status: "approved" as const } : u
      );
      setUsers(updatedUsers);
      setSelectedUser(null);
      setShowUserDetail(false);
      // Reload stats
      const statsRes = await adminApi.getStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to approve user:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    setIsActionLoading(true);
    try {
      await adminApi.rejectUser(userId, reason);
      const updatedUsers = users.map((u) =>
        u._id === userId ? { ...u, status: "rejected" as const } : u
      );
      setUsers(updatedUsers);
      setSelectedUser(null);
      setShowUserDetail(false);
      // Reload stats
      const statsRes = await adminApi.getStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to reject user:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setIsActionLoading(true);
    try {
      await adminApi.deleteUser(userId);
      const updatedUsers = users.filter((u) => u._id !== userId);
      setUsers(updatedUsers);
      setSelectedUser(null);
      setShowUserDetail(false);
      // Reload stats
      const statsRes = await adminApi.getStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Document handlers
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      alert('Only PDF, DOCX, and TXT files are allowed');
      return;
    }

    setIsUploadingDoc(true);
    setUploadStatus('uploading');
    setUploadProgress('Uploading...');

    try {
      // Step 1: Upload and get server ack
      const response = await adminApi.uploadDocument(file);
      
      // Step 2: Since processing is synchronous on server, we show embedding state while waiting
      // Actually the call is already done, but to user it feels more professional
      setUploadStatus('embedding');
      setUploadProgress('Generating Embeddings...');
      
      // Delay slightly to let the user see the "Embedding" state
      await new Promise(resolve => setTimeout(resolve, 800));

      // Add to documents list
      setDocuments(prev => [response.data.document, ...prev]);
      
      setUploadStatus('completed');
      setUploadProgress('');
      setSuccessMessage(`${file.name} uploaded and indexed successfully!`);
      
      // Show completed message for 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setSuccessMessage("");
      }, 3000);
      
      // Reset file input
      e.target.value = '';
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      setUploadStatus('error');
      alert(error.response?.data?.detail || 'Failed to upload document');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDocumentDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await adminApi.deleteDocument(docId);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                BharatShodh Admin
              </h1>
              <p className="text-sm text-slate-600">
                Welcome, {admin?.username}!
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

          <button
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 p-4">
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Total Users",
                value: stats.total_users,
                icon: Users,
                color: "from-blue-600 to-blue-700",
              },
              {
                label: "Pending",
                value: stats.pending_users,
                icon: Clock,
                color: "from-yellow-600 to-yellow-700",
              },
              {
                label: "Approved",
                value: stats.approved_users,
                icon: CheckCircle,
                color: "from-green-600 to-green-700",
              },
              {
                label: "Rejected",
                value: stats.rejected_users,
                icon: XCircle,
                color: "from-red-600 to-red-700",
              },
              {
                label: "Active Users",
                value: stats.active_users,
                icon: Users,
                color: "from-purple-600 to-purple-700",
              },
              {
                label: "Total Admins",
                value: stats.total_admins,
                icon: BarChart3,
                color: "from-indigo-600 to-indigo-700",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Section */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Users Management
            </h2>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex gap-2">
                <Filter className="w-4 h-4 text-slate-400 mt-2.5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-600">
                No users found
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {getStatusIcon(user.status)}
                          {user.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetail(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(user._id)}
                                disabled={isActionLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                title="Approve"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(user._id, "")}
                                disabled={isActionLoading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                title="Reject"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={isActionLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div className="mt-8 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Documents Management</h2>
              <label className="cursor-pointer">
                <input
                  type="file"
                  onChange={handleDocumentUpload}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  disabled={isUploadingDoc}
                />
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  uploadStatus === 'completed' ? 'bg-green-600 text-white' :
                  uploadStatus === 'error' ? 'bg-red-600 text-white' :
                  'bg-purple-600 text-white hover:bg-purple-700'
                }`}>
                  {uploadStatus === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : uploadStatus === 'error' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploadStatus === 'uploading' ? 'Uploading...' :
                   uploadStatus === 'embedding' ? 'Completing Embedding...' :
                   uploadStatus === 'completed' ? 'Completed!' :
                   uploadStatus === 'error' ? 'Upload Failed' :
                   'Upload Document'}
                </div>
              </label>
            </div>
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="w-4 h-4" />
                {successMessage}
              </div>
            )}
            <p className="text-sm text-slate-600">Upload documents (PDF, DOCX, TXT) for RAG-powered Q&A</p>
          </div>

          <div className="overflow-x-auto">
            {documents.length === 0 ? (
              <div className="p-8 text-center text-slate-600">
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Filename</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Size</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Chunks</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Uploaded</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-slate-900">{doc.filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {(doc.file_size / 1024).toFixed(2)} KB
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {doc.status === 'processing' || doc.status === 'uploaded' ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span>Processing...</span>
                          </div>
                        ) : doc.status === 'failed' ? (
                          <span className="text-red-600">Failed</span>
                        ) : (
                          `${doc.chunk_count} chunks`
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDocumentDelete(doc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">User Details</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="text-lg font-medium text-slate-900">
                  {selectedUser.email}
                </p>
              </div>

              {selectedUser.name && (
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="text-lg font-medium text-slate-900">
                    {selectedUser.name}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-600">Status</p>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(
                    selectedUser.status
                  )}`}
                >
                  {getStatusIcon(selectedUser.status)}
                  {selectedUser.status}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600">Registered</p>
                <p className="text-slate-900">
                  {new Date(selectedUser.created_at).toLocaleString()}
                </p>
              </div>

              {selectedUser.approved_at && (
                <div>
                  <p className="text-sm text-slate-600">Approved At</p>
                  <p className="text-slate-900">
                    {new Date(selectedUser.approved_at).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedUser.rejected_at && (
                <div>
                  <p className="text-sm text-slate-600">Rejected At</p>
                  <p className="text-slate-900">
                    {new Date(selectedUser.rejected_at).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedUser.rejection_reason && (
                <div>
                  <p className="text-sm text-slate-600">Rejection Reason</p>
                  <p className="text-slate-900">
                    {selectedUser.rejection_reason}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedUser.status === "pending" && (
                <div className="pt-4 flex gap-3 border-t border-slate-200">
                  <button
                    onClick={() => handleApprove(selectedUser._id)}
                    disabled={isActionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve User
                  </button>
                  <button
                    onClick={() =>
                      handleReject(selectedUser._id, "Rejected by admin")
                    }
                    disabled={isActionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject User
                  </button>
                </div>
              )}

              {selectedUser.status === "approved" && (
                <div className="pt-4 border-t border-slate-200">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Email
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleDelete(selectedUser._id)}
                  disabled={isActionLoading}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
