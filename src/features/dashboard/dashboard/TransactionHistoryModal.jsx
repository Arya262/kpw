import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, History } from "lucide-react";

const transactions = [
  {
    id: 1,
    date: "31 may ,2025 4:13 PM ",
    name: "xyz@gmail.com",
    amount: 3.54,
    status: "Success",
    type: "Paid",
    invoice: "INV-20230610-001",
  },
  {
    id: 2,
    date: "1 April ,2025 10:23 AM ",
    name: "abc@gmail.com",
    amount: 1.25,
    status: "Success",
    type: "Refunded",
    invoice: "INV-20230609-001",
  },
  {
    id: 3,
    date: "10 June ,2025 12:23 AM ",
    name: "spnknkr@gmail.com",
    amount: 1.35,
    status: "Success",
    type: "Paid",
    invoice: "INV-20230609-001",
  },
  {
    id: 4,
    date: "1 AUG ,2025 1:23 PM ",
    name: "bjkr@gmail.com",
    amount: 1.35,
    status: "Success",
    type: "Paid",
    invoice: "INV-20230609-001",
  },
  {
    id: 5,
    date: "10 may ,2025 9:23 AM ",
    name: "sbjr@gmail.com",
    amount: 1.35,
    status: "Success",
    type: "Paid",
    invoice: "INV-20230609-001",
  },
  {
    id: 6,
    date: "1 dec ,2025 1:23 PM ",
    name: "pur@gmail.com",
    amount: 1.35,
    status: "Success",
    type: "Refunded",
    invoice: "INV-20230609-001",
  },
];

const TransactionHistoryModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      { isOpen && (
        <>
          <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            exit={ { opacity: 0 } }
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={ onClose }
          >
            <motion.div
              initial={ { opacity: 0, y: 20 } }
              animate={ { opacity: 1, y: 0 } }
              exit={ { opacity: 0, y: 20 } }
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden"
              onClick={ (e) => e.stopPropagation() }
            >
              {/* Header */ }
              <div className="border-b-2 shadow-sm border-gray-300 p-3 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold mx-4 my-3 flex items-center gap-3"> <History className="w-6 h-6 text-gray-800" />Transaction History</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={ onClose } className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={ 20 } />
                  </button>
                </div>
              </div>
              {/* Transaction List */ }
              <div className="flex-1 overflow-y-auto w-full">
                <table className=" w-full divide-y divide-gray-200   ">
                  <thead className="bg-gray-50 text-center">
                    <tr>
                      <th className="px-4 py-3  text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3  text-xs font-medium text-gray-500 uppercase">Bought / Allocated By</th>
                      <th className="px-4 py-3  text-xs font-medium text-gray-500 uppercase">Top-up</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3  text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    { transactions.map((txn) => (
                      <tr key={ txn.id } className="hover:bg-gray-50 text-center">
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{ txn.date }</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">{ txn.name }</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm">₹{ txn.amount }</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            { txn.status }
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                          { txn.invoice }
                        </td>
                      </tr>
                    )) }
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </>
      ) }
    </AnimatePresence>
  );
};

export default TransactionHistoryModal;