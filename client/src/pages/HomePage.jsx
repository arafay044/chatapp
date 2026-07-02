import { lazy, Suspense } from "react";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import { useConversationStore } from "../store/useConversationStore";
import { useUIStore } from "../store/useUIStore";

const InfoPanel = lazy(() => import("../components/InfoPanel"));
const NewConversationModal = lazy(() => import("../components/NewConversationModal"));
const SearchOverlay = lazy(() => import("../components/SearchOverlay"));

const HomePage = () => {
  const selectedConversation = useConversationStore((s) => s.selectedConversation);
  const isInfoPanelOpen = useUIStore((s) => s.isInfoPanelOpen);
  const isNewConversationOpen = useUIStore((s) => s.isNewConversationOpen);
  const isSearchOverlayOpen = useUIStore((s) => s.isSearchOverlayOpen);

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <div className={`w-full md:w-[380px] shrink-0 border-r border-[var(--color-border)] ${selectedConversation ? "hidden md:block" : ""}`}>
        <ConversationList />
      </div>

      <div className={`flex-1 min-w-0 ${selectedConversation ? "" : "hidden md:block"}`}>
        <ChatWindow />
      </div>

      {selectedConversation && isInfoPanelOpen && (
        <div className="hidden lg:block w-[320px] shrink-0 border-l border-[var(--color-border)]">
          <Suspense fallback={null}>
            <InfoPanel />
          </Suspense>
        </div>
      )}

      {isNewConversationOpen && (
        <Suspense fallback={null}>
          <NewConversationModal />
        </Suspense>
      )}

      {isSearchOverlayOpen && (
        <Suspense fallback={null}>
          <SearchOverlay />
        </Suspense>
      )}
    </div>
  );
};

export default HomePage;
