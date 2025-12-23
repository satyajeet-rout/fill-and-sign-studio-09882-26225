import { useNavigate } from "react-router-dom";
import { FileUpload } from "@/components/pdf/FileUpload";

const HomePage = () => {
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    // Create an object URL for the file and navigate to the editor route
    const fileUrl = URL.createObjectURL(file);
    navigate("/fill-form", { state: { fileUrl } });
  };

  return <FileUpload onFileSelect={handleFileSelect} />;
};

export default HomePage;
