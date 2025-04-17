import React, { useState } from "react";
import axios from "axios";
import './index.css';

function App() {
  const [file, setFile] = useState(null);
  const [outputType, setOutputType] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [availableOutputTypes, setAvailableOutputTypes] = useState([]);

  const conversionMap = {
    pdf: [".txt", ".docx", ".json"],
    txt: [".pdf", ".docx", ".json"],
    docx: [".pdf", ".txt"],
    doc: [".pdf", ".txt"],
    json: [".txt", ".pdf"],
    mp3: [".mp4", ".wav"],
    mp4: [".mp3", ".avi"],
    xlsx: [".csv", ".pdf"],
    csv: [".xlsx", ".json"],
    pptx: [".pdf", ".png"]
  };

  const getExtension = (filename) => {
    return filename.split(".").pop().toLowerCase();
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setStatus("");
      setError("");
      const ext = getExtension(uploadedFile.name);
      if (conversionMap[ext]) {
        setAvailableOutputTypes(conversionMap[ext]);
        setOutputType(conversionMap[ext][0]);
      } else {
        setAvailableOutputTypes([]);
        setOutputType("");
        setError("Unsupported file type");
      }
    }
  };

  const handleConvert = async () => {
    if (!file || !outputType) {
      setError("Please upload a file and select an output format.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("output_type", outputType.replace(".", ""));


    try {
      const response = await axios.post("https://file-convertor-2q9k.onrender.com", formData, {
        responseType: "blob",
      });
      

      const link = document.createElement("a");
      link.href = URL.createObjectURL(response.data);
      link.download = `converted${outputType}`;
      link.click();

      setStatus("File converted successfully!");
      setError("");
    }  catch (err) {
      console.error("Error:", err);
      if (err.response && err.response.data) {
        const reader = new FileReader();
        reader.onload = () => {
          console.log("Server response:", reader.result);
        };
        reader.readAsText(err.response.data);
      }
      setError("Failed to convert file.");
    }
    
  };

  return (
    <div className="container">
      <h1>Convert your <span style={{ color: "#00ffcc" }}>file easily</span></h1>

      <div
        id="drop-area"
        className="drop-area"
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) {
            handleFileChange({ target: { files: [droppedFile] } });
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
        onDragLeave={(e) => e.preventDefault()}
      >
        {file ? (
          <>
            <p>File: {file.name}</p>
            <p>Type: <strong>{getExtension(file.name).toUpperCase()}</strong></p>
          </>
        ) : (
          <p>Drag & Drop your file here or click to upload</p>
        )}
      </div>

      <div className="file-input-container">
        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">Choose file</label>
      </div>

      {availableOutputTypes.length > 0 && (
        <div>
          <label>Select output format:</label>
          <select onChange={(e) => setOutputType(e.target.value)} value={outputType}>
            {availableOutputTypes.map((type) => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
        </div>
      )}

      <button onClick={handleConvert} disabled={!file || !outputType}>Convert</button>

      {status && <div className="status-message">{status}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;
