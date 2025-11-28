import { MessageCircle, Users, Sparkles } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon with animation */}
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-full shadow-lg">
            <MessageCircle className="w-16 h-16 text-white" strokeWidth={1.5} />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to Your Inbox
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Select a conversation from the sidebar to start chatting with your customers
          </p>
        </div>

        {/* Features */}
        <div className="grid gap-4 pt-4">
          <div className="flex items-start gap-3 text-left p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Real-time Messaging</h3>
              <p className="text-gray-600 text-xs mt-1">
                Send and receive messages instantly with your customers
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Manage Contacts</h3>
              <p className="text-gray-600 text-xs mt-1">
                Keep track of all your customer conversations in one place
              </p>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="pt-4">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Ready to chat
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
