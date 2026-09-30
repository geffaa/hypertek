import CreatePackage from "../components/CreatePackage";

function PackageFormPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="z-10 flex flex-col">
        <CreatePackage />
      </div>
    </div>
  );
}

export default PackageFormPage;
