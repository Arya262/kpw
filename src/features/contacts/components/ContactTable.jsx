import React from "react";
import ContactRow from "../ContactRow";
import Loader from "../../../components/Loader";
import ContactActions from "./ContactActions";

const ContactTable = ({
  displayedContacts,
  loading,
  hasSelectedContacts,
  selection,
  pagination,
  onSelectAllChange,
  onCheckboxChange,
  onEditClick,
  onDeleteClick,
  onSendBroadcast,
  onExport,
  onDelete,
  onSelectAllAcrossPages,
  user,
  permissions,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px] bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
        <table className="w-full text-sm text-center">
          <colgroup>
            {permissions.canDelete && <col className="w-12" />}
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[13%]" />
            <col />
          </colgroup>
          <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
            <tr>
              {permissions.canDelete ? (
                <th className="px-2 py-4 sm:px-6 sm:py-4">
                  <div className="flex items-center justify-center h-full">
                    <input
                      type="checkbox"
                      className="form-checkbox w-4 h-4"
                      checked={selection.mode === 'page' || selection.mode === 'all'}
                      onChange={(e) => onSelectAllChange(e, displayedContacts)}
                      ref={(el) => {
                        if (el) {
                          const selectedCount =
                            selection.mode === 'all'
                              ? pagination.totalItems - Object.keys(selection.excluded).length
                              : Object.keys(selection.selected).length;
                          const totalCount =
                            selection.mode === 'all' ? pagination.totalItems : displayedContacts.length;
                          el.indeterminate = selectedCount > 0 && selectedCount < totalCount;
                        }
                      }}
                    />
                  </div>
                </th>
              ) : null}
              {hasSelectedContacts ? (
                <ContactActions
                  hasSelectedContacts={hasSelectedContacts}
                  selectedCount={Object.keys(selection.selected).length}
                  totalCount={pagination.totalItems}
                  selectionMode={selection.mode}
                  onSendBroadcast={onSendBroadcast}
                  onExport={onExport}
                  onDelete={onDelete}
                  onSelectAllAcrossPages={onSelectAllAcrossPages}
                  displayedContactsLength={displayedContacts.length}
                  isDeleting={loading.delete}
                />
              ) : (
                <>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Created Date
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Status
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Customer Name
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Tags
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    WhatsApp Number
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    24 Hour Status
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Action
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
            {loading.contacts ? (
              <tr>
                <td colSpan="8" className="text-center py-8">
                  <Loader />
                </td>
              </tr>
            ) : displayedContacts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500 font-medium">
                  No contacts found.
                </td>
              </tr>
            ) : (
              displayedContacts.map((contact) => (
                <ContactRow
                  key={contact.contact_id}
                  contact={contact}
                  isChecked={
                    selection.mode === 'all'
                      ? !selection.excluded[contact.contact_id]
                      : !!selection.selected[contact.contact_id]
                  }
                  onCheckboxChange={onCheckboxChange}
                  onEditClick={onEditClick}
                  onDeleteClick={onDeleteClick}
                  canEdit={true}
                  canDelete={true}
                  userId={user?.id}
                  userRole={user?.role?.toLowerCase?.()}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactTable;
