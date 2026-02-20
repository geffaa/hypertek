import React from 'react';
import CreateCollection from '../components/CreateCollection';
import GlowingOrb from "../components/common/BgEffect";

function CreateCollectionsPage() {
  return (
    <div className=" flex flex-col  min-h-screen bg-black">
      {/* Background orbs */}



      {/* Main content */}
      <div className=" z-10 flex flex-col">

        <CreateCollection />

      </div>
    </div>
  );
}

export default CreateCollectionsPage;
