import { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { BiLogoJavascript } from "react-icons/bi";
import { BiSolidFileHtml } from "react-icons/bi";
import { BiSolidFileCss } from "react-icons/bi";
import { AiFillCloseCircle } from "react-icons/ai";

const Main = () => {
  // STATE MANAGEMENT
  const [file, setFile] = useState(""); // Create File Name
  const [createFile, setCreateFile] = useState([]); // Create File based on type, id, and name
  const [fileInput, setFileInput] = useState({}); // Storing input values for each file individually
  const [lock, setLock] = useState({}); // Lock and Unlock State
  const [disabled, setDisabled] = useState({}); // Disable State based on Lock and Unlock State
  const [copyText, setCopyText] = useState({}); // Copying input value for each file individually
  const [outputHTML, setOutputHTML] = useState(""); // HTML Value
  const [outputCSS, setOutputCSS] = useState(""); // CSS Value
  const [outputJS, setOutputJS] = useState(""); // JavaScript Value

  useEffect(() => {
    // Matching File type
    const htmlElements = createFile.filter((file) => file.type === "html");
    const cssElements = createFile.filter((file) => file.type === "css");
    const jsElements = createFile.filter((file) => file.type === "js");

    // Matching File id based on File type results
    const htmlInput = htmlElements.map((element) =>
      fileInput[element.id]
    );
    const cssInput = cssElements.map((element) =>
      fileInput[element.id]
    );
    const jsInput = jsElements.map((element) => fileInput[element.id]);

    // Set each file value 
    setOutputHTML(htmlInput);
    setOutputCSS(cssInput);
    setOutputJS(jsInput);
  }, [createFile, fileInput]);

  // TAKING TEXT INPUT of File Name
  const fileChange = (e) => {
    setFile(e.target.value);
  };

  // CREATE FILE ACTION
  const createClick = () => {
    if (file.slice(-3) === ".js") {   // Javascript file is created
      setCreateFile([
        ...createFile,
        { type: "js", name: file, id: new Date().getTime() },
      ]);
    } else if (file.slice(-4) === ".css") {   // CSS file is created
      setCreateFile([
        ...createFile,
        { type: "css", name: file, id: new Date().getTime() },
      ]);
    } else if (file.slice(-5) === ".html") {  // HTML file is created
      setCreateFile([
        ...createFile,
        { type: "html", name: file, id: new Date().getTime() },
      ]);
    } else {
      alert("Wrong Input");   // It will alert the user about wrong input
    }
    setFile(""); // After creation of one file empty the input field
  };

  // Adding Logo on each file by matching the type of the file
  const Logo = (fileType) => {
    if (fileType === "js") {
      return <BiLogoJavascript size={22} />;
    } else if (fileType === "css") {
      return <BiSolidFileCss size={22} />;
    } else if (fileType === "html") {
      return <BiSolidFileHtml size={22} />;
    }
  };

  // Taking Input value of a file created
  const inputChange = (id, e) => {
    const updatedFileInput = { ...fileInput };
    updatedFileInput[id] = e.target.value;
    setFileInput(updatedFileInput);
  
    // Get references to the iframe's contentDocument and contentWindow
    const outputFrame = document.getElementById("outputFrame");
    const outputDocument = outputFrame.contentDocument;
    const outputWindow = outputFrame.contentWindow;
  
    // Combine and set the HTML, CSS, and JavaScript code
    const html = outputHTML;
    const css = outputCSS;
    const js = outputJS;
    outputDocument.open();
    outputDocument.write(`
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>${html}</body>
        <script>${js}</script>
      </html>
    `);
    outputDocument.close();
  
    // Evaluate the JavaScript code
    outputWindow.eval(js);
  };
  
  // Lock/Unlock a specific file by using disabled inbuild functionality
  const lockHandler = (id) => {
    const isLocked = lock[id] || false;
    setLock({
      ...lock,
      [id]: !isLocked,
    });

    setDisabled({
      ...disabled,
      [id]: !isLocked,
    });
  };

  // COPY Text of a file by matching file id 
  const handleCopy = (id) => {
    const copiedText = fileInput[id] || "";
    navigator.clipboard.writeText(copiedText);
    setCopyText({
      ...copyText,
      [id]: true,
    });
    setTimeout(() => {
      setCopyText({ ...copyText, [id]: false }); // Copy button will be re-available after 2.5 seconds 
    }, 2500);
  };

  // Close any particular file which matches the file id 
  const closeHandler = (id) => {
    const closeFile = createFile.filter((res) => res.id !== id);
    setCreateFile(closeFile);
  };

  const saveHandler = (id) => {
    // Assuming 'fileInput[id]' contains the content we want to save
    const content = fileInput[id] || "";
  
    // Creating a Blob with the content and specifying the MIME type
    const blob = new Blob([content], { type: 'text/plain' });
  
    // Creating a download link for the Blob
    const url = URL.createObjectURL(blob);
  
    // Create an element to start the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileInput[id]}.txt`; // Specifying the desired file name
  
    // Adding a click on the element to start the download
    a.click();
  
    // Cleaning up the URL
    URL.revokeObjectURL(url);
  };

  // Checking if there are 3 Files then disable the "Create" button
  const createDisable = createFile.length === 3;

  return (
    <div>
      {/* FILE Input name and type (eg: demo.js, style.css, index.html) */}
      <div id="input">
        <h1 className="input_label">Create a File</h1>
        <p className="input_warning">
          You can only create Javascript(.js), CSS(.css), and HTML(.html) file.
        </p>
        <div className="input_blocks">
          <InputGroup>
            <Form.Control
              className="input_fileName"
              aria-label="Default"
              aria-describedby="inputGroup-sizing-default"
              value={file}
              onChange={fileChange}
            />
          </InputGroup>
          {/* Create Button */}
          <Button
            onClick={createClick}
            variant="warning"
            disabled={createDisable} /* It will be disabled after creating 3 files */
          >
            Create
          </Button>
        </div>
      </div>

      {/* FILES THAT ARE CREATED */}
      <div className="Files">
        {createFile.map((File, index) => (
          <div key={index} className="Files_content">
            <div className="Files_blocks">
              <h1 className="Files_label">
                {`${File.name}`}    {/* File Name */}
                {Logo(File.type)}   {/* File Type */}
              </h1>
              <div className="Files_btn">
                <Button
                  onClick={() => handleCopy(File.id)}
                  variant="info"
                  size="sm"
                >
                  {copyText[File.id] ? "Copied" : "Copy"}  {/* It says if the button name is copy then change it to copied */}
                </Button>
                <Button onClick={() => saveHandler(File.id)} variant="outline-success" size="sm">
                  Save
                </Button>
                <Button
                  onClick={() => lockHandler(File.id)}
                  variant="outline-danger"
                  size="sm"
                >
                  {lock[File.id] ? "Unlock" : "Lock"} {/* It says if the button name is lock then change it to unlock */}
                </Button>
                <AiFillCloseCircle
                  size={25}
                  className="cursor-pointer"
                  onClick={() => closeHandler(File.id)}  /* Close Button */
                >
                  Close
                </AiFillCloseCircle>
              </div>
            </div>
            {/* Text Input inside a file */}
            <InputGroup>
              <Form.Control
                className="Files_input"
                as="textarea"
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                value={fileInput[File.id] || ""} /* Updated */
                onChange={(e) => inputChange(File.id, e)} /* It will update the value */
                disabled={disabled[File.id] || false}     /* Lock Functionality */
              />
            </InputGroup>
          </div>
        ))}
      </div>
      {/* OUTPUT BOX */}
      <div className="output">
        <h1 className="output_label">OUTPUT:</h1>
        <iframe id="outputFrame" className="output_fileName"></iframe> {/* Output iframe */}
      </div>
    </div>
  );
};

export default Main;