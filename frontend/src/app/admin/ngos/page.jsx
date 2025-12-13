"use client";

import { useAdminNgos } from "../../hooks/useAdminNgos";
import StatusColumn from "./components/StatusColumn";

/**
 * Admin NGO Management Page
 * Kanban-style board for managing NGO registrations
 */
export default function AdminNgosPage() {
  const { columns, handleSearch, handlePageChange } = useAdminNgos();

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          NGO Registrations Management
        </h1>
        <p className="text-gray-600 mt-1">
          Review and manage NGO registration requests
        </p>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Pending Column */}
          <StatusColumn
            title="Pending"
            status="pending"
            data={columns.pending.data}
            loading={columns.pending.loading}
            pagination={columns.pending.pagination}
            searchValue={columns.pending.search}
            onSearch={(query) => handleSearch("pending", query)}
            onPageChange={(page) => handlePageChange("pending", page)}
            color="yellow"
          />

          {/* Approved Column */}
          <StatusColumn
            title="Approved"
            status="approved"
            data={columns.approved.data}
            loading={columns.approved.loading}
            pagination={columns.approved.pagination}
            searchValue={columns.approved.search}
            onSearch={(query) => handleSearch("approved", query)}
            onPageChange={(page) => handlePageChange("approved", page)}
            color="green"
          />

          {/* Rejected Column */}
          <StatusColumn
            title="Rejected"
            status="rejected"
            data={columns.rejected.data}
            loading={columns.rejected.loading}
            pagination={columns.rejected.pagination}
            searchValue={columns.rejected.search}
            onSearch={(query) => handleSearch("rejected", query)}
            onPageChange={(page) => handlePageChange("rejected", page)}
            color="red"
          />

          {/* Blocked Column */}
          <StatusColumn
            title="Blocked"
            status="blocked"
            data={columns.blocked.data}
            loading={columns.blocked.loading}
            pagination={columns.blocked.pagination}
            searchValue={columns.blocked.search}
            onSearch={(query) => handleSearch("blocked", query)}
            onPageChange={(page) => handlePageChange("blocked", page)}
            color="gray"
          />
        </div>
      </div>
    </div>
  );
}
