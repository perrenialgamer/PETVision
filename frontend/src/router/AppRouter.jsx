import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "../pages/UploadPage";
import BatchResultPage from "../pages/BatchResultPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/result" element={<BatchResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
