import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import CreateCollections from "./pages/CreateCollections";
import CollectionTable from "./pages/CollectionTable";
import CollectionDetails from "./pages/CollectionDetails";
import CreatorEarning from "./pages/CreatorEarning";
import Character from "./pages/Character";
import Land from "./pages/Land";
import EditUsers from "./pages/EditUser";
import UpdateNews from "./pages/UpdateNews";
import CollectionListedForSale from "./pages/CollectionListedForSale";
import CollectionDetails2 from "./pages/CollectionDetails2";
import UserDetails from "./pages/UserDetails";
import UserCollections from "./pages/UserCollections";
import EditNews from "./EditNews";
import UploadedNews from "./pages/UploadedNews";
import OtherNews from "./pages/OtherNews";
import EditCollection2 from "./pages/EditCollection2";
import AddCollection from "./pages/AddCollection";
import Support from "./pages/Support";
import ProtectedRoute from "./ProtectedRoute";
import NotificationsPage from "./pages/Notifications";
import EditAdminProfile from "./pages/EditProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}

          <Route path="/:userId" element={<DashboardLayout />}>
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
            {/* Nested dashboard routes */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="create-collection" element={<CreateCollections />} />
            <Route path="collection-details" element={<CollectionTable />} />
            <Route path="edit-collection" element={<CollectionDetails />} />
            <Route path="creator-earning" element={<CreatorEarning />} />
            <Route path="collections" element={<AddCollection />} />
            <Route path="edit-collection-item" element={<EditCollection2 />} />
            <Route path="character-collection" element={<Character />} />
            <Route path="land-collection" element={<Land />} />
            <Route path="collection-listed-sale" element={<CollectionListedForSale />} />
            <Route path="collection-details-2" element={<CollectionDetails2 />} />
            <Route path="edit-user" element={<EditUsers />} />
            <Route path="users" element={<UserDetails />} />
            <Route path="user-details" element={<UserCollections />} />
            <Route path="add-news" element={<UpdateNews />} />
            <Route path="other-news" element={<OtherNews />} />
            <Route path="edit-news" element={<EditNews />} />
            <Route path="edit-news-item" element={<UploadedNews />} />
            <Route path="support" element={<Support />} />
            <Route path="notification" element={<NotificationsPage />} />
           
          </Route>
        </Route>

        {/* // Admin Profile (outside user routes) */}
<Route path="/edit-profile" element={<EditAdminProfile />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  );
}

export default App;
