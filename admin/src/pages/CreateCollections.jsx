import React from 'react';
import CreateCollection from '../components/CreateCollection';

function CreateCollectionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="z-10 flex flex-col">

        <CreateCollection />

      </div>
    </div>
  );
}

export default CreateCollectionsPage;
