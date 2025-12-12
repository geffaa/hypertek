import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";

function CollectionTable() {
  const navigate = useNavigate();

  // Dummy data — replace with API data later
  const [collections, setCollections] = useState([
    { 
      id: 1, 
      name: "My Art Collection", 
      createdAt: "2025-11-21",
      items: 24,
      status: "Active"
    },
    { 
      id: 2, 
      name: "Gaming Avatars", 
      createdAt: "2025-11-20",
      items: 15,
      status: "Active"
    },
    { 
      id: 3, 
      name: "Digital Posters", 
      createdAt: "2025-11-19",
      items: 8,
      status: "Draft"
    },
    { 
      id: 4, 
      name: "3D Models Pack", 
      createdAt: "2025-11-18",
      items: 32,
      status: "Active"
    },
  ]);

  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter collections based on search
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    setCollections(collections.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    setIsModalOpen(false);
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDeleteId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Draft": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Inactive": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white p-8">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-900/15 rounded-full blur-[80px]"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              My Collections
            </h1>
            <p className="text-gray-400 mt-2">Manage your digital collections</p>
          </div>
          
          {/* <button
            onClick={() => navigate("/create-collection")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <FiPlus size={20} />
            Create New Collection
          </button> */}
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-gray-800/50 transition-all duration-200 backdrop-blur-sm"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{collections.length}</div>
            <div className="text-gray-400 text-sm">Total Collections</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {collections.filter(c => c.status === "Active").length}
            </div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {collections.reduce((acc, curr) => acc + curr.items, 0)}
            </div>
            <div className="text-gray-400 text-sm">Total Items</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">100%</div>
            <div className="text-gray-400 text-sm">Success Rate</div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <th className="py-4 px-6 text-left font-semibold text-gray-300">Collection Name</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-300">Items</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-300">Status</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-300">Created At</th>
                  <th className="py-4 px-6 text-center font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCollections.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-all duration-200 group"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.5s ease-out forwards'
                    }}
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                        {item.name}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-300">{item.items} items</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">{item.createdAt}</td>

                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-3">
                        {/* Edit Button */}
                        <button
                          onClick={() => navigate(`/edit-collection`)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all duration-200 group/edit"
                          title="Edit Collection"
                        >
                          <FiEdit className="text-blue-400 group-hover/edit:text-blue-300" size={18} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => openDeleteModal(item.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all duration-200 group/delete"
                          title="Delete Collection"
                        >
                          <FiTrash2 className="text-red-400 group-hover/delete:text-red-300" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredCollections.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No collections found</div>
              <div className="text-gray-500">Create your first collection to get started</div>
            </div>
          )}
        </div>
      </div>

      {/* Animated Delete Confirmation Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className={`bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md transform transition-all duration-300 ${
              isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideIn 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FiTrash2 className="text-red-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Delete Collection</h2>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <p className="text-gray-300">
                Are you sure you want to delete <span className="text-white font-semibold">
                  {collections.find(c => c.id === deleteId)?.name}
                </span>? This will permanently remove the collection and all its data.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 bg-red-900 hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-200 font-medium shadow-lg shadow-red-500/25"
              >
                Delete Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default CollectionTable;