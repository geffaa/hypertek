import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import CollectionDetails from "./pages/CollectionDetails";
import CreatorEarning from "./pages/CreatorEarning";
import Character from "./pages/Character";
import Land from "./pages/Land";
import EditUsers from "./pages/EditUser";
import UpdateNews from "./pages/UpdateNews";
import CollectionOnSale from "./pages/CollectionOnSale";
import Transactions from "./pages/Transactions";
import Support from "./pages/Support";
import CreateCollections from "./pages/CreateCollections";
import Collections from "./pages/Collections";
import EditCollection from "./pages/EditCollection";
import AddCollection from "./pages/AddCollection"
import EditCollection2 from "./pages/EditCollection2";
import CollectionListedForSale from "./pages/CollectionListedForSale";
import CollectionDetails2 from "./pages/CollectionDetails2";
import UserDetails from "./pages/UserDetails";
import UserCollections from "./pages/UserCollections";
import EditNews from "./EditNews";
import UploadedNews from "./pages/UploadedNews";
import OtherNews from "./pages/OtherNews";
import CollectionTable from "./pages/CollectionTable";

import { Toaster } from "react-hot-toast";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          {/* Default page */}
          <Route index element={<Dashboard />} />



{/* ---------------------------------------------  */}
          {/* Create collection 1 */}
          <Route path="create-collection" element={<CreateCollections />} />

          {/* Collection details 1.1 */}
          <Route path="collection-details" element={<CollectionTable />} />
          

          {/* Edit Collection 1.3  */}
          <Route path="edit-collection" element={<CollectionDetails/>}/>

          {/* Collection Earning 1.2  */}
          <Route path="creator-earning" element={<CreatorEarning />} />


          {/* -------------------------------------------- */}

          {/* Collections 2  */}
          <Route path="collections" element={<AddCollection/>}/>
          <Route path="edit-collection-item" element={<EditCollection2/>}/>
          <Route path="character-collection" element={<Character />} />
          <Route path="land-collection" element={<Land />} />
          <Route path="collection-listed-sale" element={<CollectionListedForSale />} />
          <Route path="collection-details-2" element={<CollectionDetails2 />} />

        {/* Edit Users 3  */}
          <Route path="edit-user" element={<EditUsers />} />
          <Route path="users" element={<UserDetails />} />
          <Route path="user-details" element={<UserCollections />} />


        {/* News 4  */}
          <Route path="add-news" element={<UpdateNews />} />
          <Route path="other-news" element={<OtherNews />} />
          <Route path="edit-news" element={<EditNews />} />
          <Route path="edit-news-item" element={<UploadedNews />} />


          {/* Transaction 5  */}
          <Route path="transactions" element={<Transactions />} />

          {/* Support 6  */}
          <Route path="support" element={<Support />} />

          
          {/* <Route path="collection-on-sale" element={<CollectionOnSale />} /> */}
        </Route>
      </Routes>
          <Toaster position="top-right" reverseOrder={false} />

    </BrowserRouter>
  );
}

export default App;
