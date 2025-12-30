"use client";

import React, { useState } from "react";
import Layout from "@/app/components/Layout";
import {
  Award,
  Download,
  Eye,
  Calendar,
  Trophy,
  FileCheck,
  Share2,
  Grid3x3,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CertificatesPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mock certificates data
  const allCertificates = [
    {
      id: 1,
      eventName: "Food Bank Volunteer 2024",
      eventType: "Volunteer",
      issueDate: new Date("2024-02-18"),
      hours: 4,
      role: "Food Packager",
      certificateUrl: "/certificates/cert-001.pdf",
      thumbnail: "/certificates/cert-001-thumb.jpg",
    },
    {
      id: 2,
      eventName: "Charity Run 2024 - 10KM Marathon",
      eventType: "Participant",
      issueDate: new Date("2024-02-16"),
      position: "Completed",
      category: "10KM Marathon",
      certificateUrl: "/certificates/cert-002.pdf",
      thumbnail: "/certificates/cert-002-thumb.jpg",
    },
    {
      id: 3,
      eventName: "Community Clean Up Day",
      eventType: "Participant",
      issueDate: new Date("2024-02-21"),
      category: "General Participant",
      certificateUrl: "/certificates/cert-003.pdf",
      thumbnail: "/certificates/cert-003-thumb.jpg",
    },
    {
      id: 4,
      eventName: "Community Kitchen Helper",
      eventType: "Volunteer",
      issueDate: new Date("2024-02-19"),
      hours: 4,
      role: "Kitchen Assistant",
      certificateUrl: "/certificates/cert-004.pdf",
      thumbnail: "/certificates/cert-004-thumb.jpg",
    },
    {
      id: 5,
      eventName: "Marathon Training Camp",
      eventType: "Participant",
      issueDate: new Date("2024-02-08"),
      category: "Training Program",
      certificateUrl: "/certificates/cert-005.pdf",
      thumbnail: "/certificates/cert-005-thumb.jpg",
    },
    {
      id: 6,
      eventName: "Beach Cleanup Initiative",
      eventType: "Volunteer",
      issueDate: new Date("2024-01-13"),
      hours: 3,
      role: "Team Leader",
      certificateUrl: "/certificates/cert-006.pdf",
      thumbnail: "/certificates/cert-006-thumb.jpg",
    },
    {
      id: 7,
      eventName: "Charity Concert - Sound Crew",
      eventType: "Volunteer",
      issueDate: new Date("2024-02-04"),
      hours: 6,
      role: "Sound Technician",
      certificateUrl: "/certificates/cert-007.pdf",
      thumbnail: "/certificates/cert-007-thumb.jpg",
    },
    {
      id: 8,
      eventName: "Education Workshop Facilitator",
      eventType: "Volunteer",
      issueDate: new Date("2024-01-20"),
      hours: 8,
      role: "Workshop Facilitator",
      certificateUrl: "/certificates/cert-008.pdf",
      thumbnail: "/certificates/cert-008-thumb.jpg",
    },
  ];

  // Search filter
  const filteredCertificates = allCertificates.filter(
    (cert) =>
      searchQuery === "" ||
      cert.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.eventType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCertificates = filteredCertificates.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getTypeColor = (type) => {
    return type === "Volunteer"
      ? { bg: "bg-blue-100", text: "text-blue-700" }
      : { bg: "bg-purple-100", text: "text-purple-700" };
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-gray-600 mt-2">
            View and download your participation certificates
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search certificates by event name or type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* View Toggle & Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-gray-900">
                Total Certificates:{" "}
                <span className="text-emerald-600">
                  {filteredCertificates.length}
                </span>
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {filteredCertificates.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredCertificates.length)}{" "}
            of {filteredCertificates.length} certificates
          </div>
        )}

        {/* Certificates Grid/List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {paginatedCertificates.length === 0 ? (
            <div className="text-center py-16">
              <Award className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Certificates Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Complete events to earn certificates"}
              </p>
              {!searchQuery && (
                <a
                  href="/events"
                  className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse Events
                </a>
              )}
            </div>
          ) : viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {paginatedCertificates.map((cert) => {
                const typeColor = getTypeColor(cert.eventType);

                return (
                  <div
                    key={cert.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all group"
                  >
                    {/* Certificate Thumbnail */}
                    <div className="h-48 bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <Award className="h-20 w-20 text-emerald-600 opacity-20" />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${typeColor.bg} ${typeColor.text}`}
                        >
                          {cert.eventType}
                        </span>
                      </div>
                    </div>

                    {/* Certificate Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {cert.eventName}
                      </h3>

                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Issued: {cert.issueDate.toLocaleDateString()}
                          </span>
                        </div>
                        {cert.hours && (
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            <span>
                              {cert.hours} hours • {cert.role}
                            </span>
                          </div>
                        )}
                        {cert.category && (
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            <span>{cert.category}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="divide-y divide-gray-200">
              {paginatedCertificates.map((cert) => {
                const typeColor = getTypeColor(cert.eventType);

                return (
                  <div
                    key={cert.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="h-12 w-12 text-emerald-600 opacity-40" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {cert.eventName}
                            </h3>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${typeColor.bg} ${typeColor.text}`}
                            >
                              {cert.eventType}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-500">Issue Date</p>
                            <p className="font-medium text-gray-900">
                              {cert.issueDate.toLocaleDateString()}
                            </p>
                          </div>
                          {cert.hours && (
                            <div>
                              <p className="text-gray-500">Hours</p>
                              <p className="font-medium text-gray-900">
                                {cert.hours} hours
                              </p>
                            </div>
                          )}
                          {cert.role && (
                            <div>
                              <p className="text-gray-500">Role</p>
                              <p className="font-medium text-gray-900">
                                {cert.role}
                              </p>
                            </div>
                          )}
                          {cert.category && (
                            <div>
                              <p className="text-gray-500">Category</p>
                              <p className="font-medium text-gray-900">
                                {cert.category}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 text-sm font-medium">
                            <Download className="h-4 w-4" />
                            Download PDF
                          </button>
                          <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm">
                            <Eye className="h-4 w-4" />
                            Preview
                          </button>
                          <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2 text-sm">
                            <Share2 className="h-4 w-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 mb-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-900 mb-1">
                  Auto-Generated
                </h3>
                <p className="text-sm text-emerald-700">
                  Certificates are automatically generated after event
                  completion
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Download PDF
                </h3>
                <p className="text-sm text-blue-700">
                  Download high-quality PDF certificates for printing
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Share2 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">
                  Share Achievement
                </h3>
                <p className="text-sm text-purple-700">
                  Share your certificates on social media platforms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CertificatesPage;
